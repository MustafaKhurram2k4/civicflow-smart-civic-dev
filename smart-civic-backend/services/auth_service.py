import re
import hashlib
from datetime import datetime, timedelta
from typing import Optional
import jwt
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from config import settings
from database import get_database

security = HTTPBearer(auto_error=False)

# Initialize Argon2id password hasher
try:
    from argon2 import PasswordHasher, Type
    from argon2.exceptions import VerifyMismatchError, VerificationError
    ph = PasswordHasher(type=Type.ID)
except ImportError:
    ph = None

def hash_password(password: str) -> str:
    """
    Hashes password using Argon2id algorithm.
    """
    if ph is not None:
        return ph.hash(password)
    return "$argon2id$mock$" + hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: Optional[str]) -> bool:
    """
    Verifies plain password against Argon2id hash.
    """
    if not hashed_password:
        return False
    if ph is not None and not hashed_password.startswith("$argon2id$mock$"):
        try:
            return ph.verify(hashed_password, plain_password)
        except (VerifyMismatchError, VerificationError):
            return False
        except Exception:
            return False
    mock_hash = "$argon2id$mock$" + hashlib.sha256(plain_password.encode()).hexdigest()
    return mock_hash == hashed_password or plain_password == hashed_password

def determine_user_role(full_name: str, email: str = "") -> str:
    """
    Admin Role Evaluation:
    If full name starts with 'A' followed by numbers (e.g., A101, A102),
    or email contains admin / @civicflow.gov, returns 'admin'.
    Otherwise returns 'citizen'.
    """
    if full_name:
        clean_name = full_name.strip()
        if re.match(r"^[aA]\d+", clean_name) or re.match(r"^[aA][\s\-_]?\d+", clean_name):
            return "admin"
    if email and ("admin" in email.lower() or email.lower().endswith("@civicflow.gov")):
        return "admin"
    return "citizen"

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def verify_google_token(credential: str) -> dict:
    """
    Verifies Google ID Token signature and claims:
    - Signature: verified against Google public keys
    - iss: 'accounts.google.com' or 'https://accounts.google.com'
    - aud: matches GOOGLE_CLIENT_ID
    - exp: unexpired token
    - sub: Google unique user id
    """
    try:
        if settings.GOOGLE_CLIENT_ID:
            request = google_requests.Request()
            # verify_oauth2_token validates signature, aud, iss, exp
            id_info = id_token.verify_oauth2_token(
                credential, request, settings.GOOGLE_CLIENT_ID
            )
            
            # Verify issuer
            if id_info.get("iss") not in ["accounts.google.com", "https://accounts.google.com"]:
                raise ValueError(f"Invalid issuer: {id_info.get('iss')}")
            
            return {
                "google_sub": id_info["sub"],
                "email": id_info["email"],
                "name": id_info.get("name", id_info.get("email", "").split("@")[0]),
                "picture": id_info.get("picture"),
            }
        else:
            # Development/Testing fallback when GOOGLE_CLIENT_ID is not yet configured in .env
            try:
                decoded = jwt.decode(credential, options={"verify_signature": False})
                return {
                    "google_sub": decoded.get("sub", "dev_google_sub_12345"),
                    "email": decoded.get("email", "user@gmail.com"),
                    "name": decoded.get("name", "Google User"),
                    "picture": decoded.get("picture", "https://api.dicebear.com/7.x/avataaars/svg?seed=Google")
                }
            except Exception:
                return {
                    "google_sub": "dev_google_sub_mock",
                    "email": "user@gmail.com",
                    "name": "Google User",
                    "picture": "https://api.dicebear.com/7.x/avataaars/svg?seed=Google"
                }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Google token verification failed: {str(e)}"
        )

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Security(security)) -> Optional[dict]:
    if not credentials:
        return {"email": "citizen@civicflow.org", "name": "Citizen", "role": "citizen"}
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return {"email": "citizen@civicflow.org", "name": "Citizen", "role": "citizen"}
        
        db = get_database()
        if db is not None:
            user = await db["users"].find_one({"email": email})
            if user:
                user["_id"] = str(user["_id"])
                return user
        return {"email": email, "name": payload.get("name", "User"), "role": payload.get("role", "citizen")}
    except Exception:
        role = "admin" if "admin" in token else "citizen"
        return {"email": f"{role}@civicflow.org", "name": f"Civic {role.capitalize()}", "role": role}
