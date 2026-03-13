from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from core.database import Base

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    booking_id = Column(Integer, ForeignKey("bookings.id"))

    rating = Column(Float, nullable=False)  # 1-5
    rating_limpieza = Column(Float, default=5.0)
    rating_comunicacion = Column(Float, default=5.0)
    rating_ubicacion = Column(Float, default=5.0)
    rating_valor = Column(Float, default=5.0)
    comentario = Column(Text)
    respuesta_host = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    property = relationship("Property", back_populates="reviews")
    author = relationship("User", back_populates="reviews", foreign_keys=[author_id])
    booking = relationship("Booking", back_populates="review")

class Favorite(Base):
    __tablename__ = "favorites"
    __table_args__ = (UniqueConstraint("user_id", "property_id"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="favorites")
    property = relationship("Property", back_populates="favorites")
