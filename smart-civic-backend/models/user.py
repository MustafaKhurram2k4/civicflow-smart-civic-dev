from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

# -----------------------------------------------------------------------------
# Common Auth Models
# -----------------------------------------------------------------------------
class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class GoogleAuthRequest(BaseModel):
    credential: str  # Google OAuth ID Token (JWT)

# -----------------------------------------------------------------------------
# 1. Citizen Schema & Model (stored in MongoDB 'citizens' collection)
# -----------------------------------------------------------------------------
class CitizenBase(BaseModel):
    email: str
    name: str
    phone: Optional[str] = None
    picture: Optional[str] = None
    role: str = "citizen"
    auth_provider: str = "local"  # local | google
    google_sub: Optional[str] = None

class CitizenInDB(CitizenBase):
    id: str = Field(..., alias="_id")
    password_hash: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True

class CitizenResponse(CitizenBase):
    id: str
    created_at: datetime

# -----------------------------------------------------------------------------
# 2. Admin / Municipal Officer Schema & Model (stored in MongoDB 'admins' collection)
# -----------------------------------------------------------------------------
class AdminBase(BaseModel):
    admin_id: str  # e.g. A101, A102
    email: str
    name: str  # e.g. A101
    department: Optional[str] = "Municipal Operations"
    picture: Optional[str] = None
    role: str = "admin"
    auth_provider: str = "local"  # local | google
    google_sub: Optional[str] = None

class AdminInDB(AdminBase):
    id: str = Field(..., alias="_id")
    password_hash: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True

class AdminResponse(AdminBase):
    id: str
    created_at: datetime

# -----------------------------------------------------------------------------
# Unified User Response & Token
# -----------------------------------------------------------------------------
class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str  # citizen | admin
    admin_id: Optional[str] = None
    phone: Optional[str] = None
    picture: Optional[str] = None
    auth_provider: str = "local"
    google_sub: Optional[str] = None
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
