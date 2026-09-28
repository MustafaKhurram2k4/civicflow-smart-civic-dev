import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, status
from models.user import GoogleAuthRequest, Token, UserResponse, UserRegister, UserLogin
from services.auth_service import (
    verify_google_token,
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
    determine_user_role
)
from database import get_database

router = APIRouter(prefix="/auth", tags=["Authentication"])

# In-memory fallbacks if MongoDB is temporarily offline
_in_memory_citizens: dict[str, dict] = {}
_in_memory_admins: dict[str, dict] = {}

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register_user(body: UserRegister):
    """
    Register a new user account.
    - Admins (e.g. A101, A102) are saved in the 'admins' collection.
    - Citizens are saved in the 'citizens' collection.
    - Passwords are encrypted with Argon2id.
    """
    email = body.email.strip().lower()
    full_name = body.full_name.strip()
    db = get_database()
    
    role = determine_user_role(full_name, email)
    collection_name = "admins" if role == "admin" else "citizens"
    
    # Check for existing account in both collections
    if db is not None:
        exists_citizen = await db["citizens"].find_one({"email": email})
        exists_admin = await db["admins"].find_one({"email": email})
        if exists_citizen or exists_admin:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email address already exists."
            )
    else:
        if email in _in_memory_citizens or email in _in_memory_admins:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email address already exists."
            )

    hashed_pwd = hash_password(body.password)
    now = datetime.utcnow()
    picture_url = f"https://api.dicebear.com/7.x/avataaars/svg?seed={full_name}"

    if role == "admin":
        # Save to admins collection
        user_doc = {
            "admin_id": full_name,
            "email": email,
            "name": full_name,
            "department": "Municipal Operations",
            "picture": picture_url,
            "role": "admin",
            "auth_provider": "local",
            "google_sub": None,
            "password_hash": hashed_pwd,
            "created_at": now,
            "updated_at": now
        }
        if db is not None:
            res = await db["admins"].insert_one(user_doc)
            user_id = str(res.inserted_id)
        else:
            user_id = str(uuid.uuid4())
            _in_memory_admins[email] = {**user_doc, "_id": user_id}
            
        user_response = UserResponse(
            id=user_id,
            email=email,
            name=full_name,
            admin_id=full_name,
            role="admin",
            picture=picture_url,
            auth_provider="local",
            google_sub=None,
            created_at=now
        )
    else:
        # Save to citizens collection
        user_doc = {
            "email": email,
            "name": full_name,
            "phone": body.phone or "",
            "picture": picture_url,
            "role": "citizen",
            "auth_provider": "local",
            "google_sub": None,
            "password_hash": hashed_pwd,
            "created_at": now,
            "updated_at": now
        }
        if db is not None:
            res = await db["citizens"].insert_one(user_doc)
            user_id = str(res.inserted_id)
        else:
            user_id = str(uuid.uuid4())
            _in_memory_citizens[email] = {**user_doc, "_id": user_id}

        user_response = UserResponse(
            id=user_id,
            email=email,
            name=full_name,
            phone=body.phone,
            role="citizen",
            picture=picture_url,
            auth_provider="local",
            google_sub=None,
            created_at=now
        )

    token_data = {"sub": email, "name": full_name, "role": role}
    access_token = create_access_token(data=token_data)
    
    return Token(access_token=access_token, token_type="bearer", user=user_response)


@router.post("/login", response_model=Token)
async def login_user(body: UserLogin):
    """
    Authenticate user across 'citizens' and 'admins' collections.
    """
    email = body.email.strip().lower()
    db = get_database()
    user = None
    role = "citizen"
    
    if db is not None:
        user = await db["citizens"].find_one({"email": email})
        if not user:
            user = await db["admins"].find_one({"email": email})
            if user:
                role = "admin"
        else:
            role = "citizen"
    else:
        if email in _in_memory_citizens:
            user = _in_memory_citizens[email]
            role = "citizen"
        elif email in _in_memory_admins:
            user = _in_memory_admins[email]
            role = "admin"

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    stored_hash = user.get("password_hash") or user.get("hashed_password")
    if not stored_hash or not verify_password(body.password, stored_hash):
        if user.get("auth_provider") == "google":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This account was registered with Google. Please sign in using Google."
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    user_id = str(user["_id"])
    name = user.get("name", "User")
    
    token_data = {"sub": email, "name": name, "role": role}
    access_token = create_access_token(data=token_data)
    
    user_response = UserResponse(
        id=user_id,
        email=email,
        name=name,
        admin_id=user.get("admin_id"),
        phone=user.get("phone"),
        picture=user.get("picture"),
        role=role,
        auth_provider=user.get("auth_provider", "local"),
        google_sub=user.get("google_sub"),
        created_at=user.get("created_at", datetime.utcnow())
    )
    
    return Token(access_token=access_token, token_type="bearer", user=user_response)


@router.post("/google", response_model=Token)
async def google_login(body: GoogleAuthRequest):
    """
    Authenticate user using Google OAuth ID Token.
    Upserts into 'admins' or 'citizens' collections based on role.
    """
    google_claims = await verify_google_token(body.credential)
    db = get_database()
    
    email = google_claims["email"].strip().lower()
    name = google_claims["name"]
    google_sub = google_claims["google_sub"]
    picture = google_claims.get("picture")
    
    role = determine_user_role(name, email)
    collection_name = "admins" if role == "admin" else "citizens"
    now = datetime.utcnow()
    
    user_doc = {
        "email": email,
        "name": name,
        "picture": picture,
        "google_sub": google_sub,
        "auth_provider": "google",
        "password_hash": None,
        "role": role,
        "updated_at": now
    }
    if role == "admin":
        user_doc["admin_id"] = name
        user_doc["department"] = "Municipal Operations"
    else:
        user_doc["phone"] = ""

    if db is not None:
        await db[collection_name].update_one(
            {"email": email},
            {
                "$set": user_doc,
                "$setOnInsert": {"created_at": now}
            },
            upsert=True
        )
        existing = await db[collection_name].find_one({"email": email})
        user_id = str(existing["_id"])
        created_at = existing.get("created_at", now)
    else:
        mem_store = _in_memory_admins if role == "admin" else _in_memory_citizens
        if email in mem_store:
            user_id = mem_store[email]["_id"]
            created_at = mem_store[email]["created_at"]
            mem_store[email].update({**user_doc, "updated_at": now})
        else:
            user_id = str(uuid.uuid4())
            created_at = now
            mem_store[email] = {**user_doc, "_id": user_id, "created_at": created_at}

    token_data = {"sub": email, "name": name, "role": role}
    access_token = create_access_token(data=token_data)
    
    user_response = UserResponse(
        id=user_id,
        email=email,
        name=name,
        admin_id=user_doc.get("admin_id"),
        picture=picture,
        role=role,
        auth_provider="google",
        google_sub=google_sub,
        created_at=created_at
    )
    
    return Token(access_token=access_token, token_type="bearer", user=user_response)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    
    return UserResponse(
        id=str(current_user.get("_id", "1")),
        email=current_user["email"],
        name=current_user["name"],
        admin_id=current_user.get("admin_id"),
        picture=current_user.get("picture"),
        role=current_user.get("role", "citizen"),
        phone=current_user.get("phone"),
        auth_provider=current_user.get("auth_provider", "local"),
        google_sub=current_user.get("google_sub"),
        created_at=current_user.get("created_at", datetime.utcnow())
    )
