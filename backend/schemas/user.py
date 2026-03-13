from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from models.user import RolEnum

class UserCreate(BaseModel):
    email: str
    full_name: str
    password: str
    phone: Optional[str] = None
    rol: RolEnum = RolEnum.GUEST

class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    rol: Optional[RolEnum] = None
    is_active: Optional[bool] = None

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    phone: Optional[str]
    bio: Optional[str]
    avatar_url: Optional[str]
    rol: RolEnum
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserPublic(BaseModel):
    id: int
    full_name: str
    avatar_url: Optional[str]
    bio: Optional[str]
    rol: RolEnum
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
