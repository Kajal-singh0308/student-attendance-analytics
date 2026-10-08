from pydantic import BaseModel
from typing import Optional
from app.models.user import UserRole

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: UserRole

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    is_active: bool

    model_config = {"from_attributes": True}
