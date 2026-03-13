from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, Text, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from core.database import Base
import enum

class RolEnum(str, enum.Enum):
    GUEST = "GUEST"
    HOST = "HOST"
    ADMIN = "ADMIN"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(150), unique=True, nullable=False, index=True)
    full_name = Column(String(150), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    phone = Column(String(30))
    avatar_url = Column(String(500))
    bio = Column(Text)
    rol = Column(Enum(RolEnum), default=RolEnum.GUEST)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    properties = relationship("Property", back_populates="host", foreign_keys="Property.host_id")
    bookings = relationship("Booking", back_populates="guest", foreign_keys="Booking.guest_id")
    reviews = relationship("Review", back_populates="author", foreign_keys="Review.author_id")
    favorites = relationship("Favorite", back_populates="user")
