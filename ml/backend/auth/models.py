from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from .database import Base

# SQLAlchemy Model
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, unique=True, index=True, nullable=True)
    passwordHash = Column(String, nullable=False)
    authProvider = Column(String, default="local") # e.g., local, google, phone
    emailVerified = Column(Boolean, default=False)
    phoneVerified = Column(Boolean, default=False)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now())
    movieMindProfile = Column(String, nullable=True) # Could store JSON string or reference
    preferences = Column(String, nullable=True) # Could store JSON string
    lastLogin = Column(DateTime(timezone=True), nullable=True)


# Pydantic Schemas

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: Optional[str] = None
    authProvider: str
    emailVerified: bool
    phoneVerified: bool
    createdAt: datetime
    movieMindProfile: Optional[str] = None
    preferences: Optional[str] = None
    lastLogin: Optional[datetime] = None

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
