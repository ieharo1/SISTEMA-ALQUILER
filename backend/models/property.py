from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, Text, Float, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from core.database import Base
import enum

class TipoEnum(str, enum.Enum):
    HOTEL = "HOTEL"
    APARTAMENTO = "APARTAMENTO"
    CASA = "CASA"
    VILLA = "VILLA"
    CABAÑA = "CABAÑA"
    HOSTAL = "HOSTAL"

class EstadoEnum(str, enum.Enum):
    ACTIVO = "ACTIVO"
    INACTIVO = "INACTIVO"
    PENDIENTE = "PENDIENTE"

class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    host_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    titulo = Column(String(200), nullable=False)
    descripcion = Column(Text)
    tipo = Column(Enum(TipoEnum), default=TipoEnum.APARTAMENTO)
    estado = Column(Enum(EstadoEnum), default=EstadoEnum.ACTIVO)

    # Location
    pais = Column(String(100), default="Ecuador")
    ciudad = Column(String(100), nullable=False)
    direccion = Column(String(300))
    latitud = Column(Float)
    longitud = Column(Float)

    # Details
    precio_noche = Column(Float, nullable=False)
    max_huespedes = Column(Integer, default=2)
    habitaciones = Column(Integer, default=1)
    camas = Column(Integer, default=1)
    banos = Column(Integer, default=1)

    # Media
    imagen_principal = Column(String(500))
    imagenes = Column(JSON, default=list)

    # Amenities stored as JSON list
    amenidades = Column(JSON, default=list)

    # Rating (computed, stored for performance)
    rating_promedio = Column(Float, default=0.0)
    total_reviews = Column(Integer, default=0)
    total_bookings = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    host = relationship("User", back_populates="properties", foreign_keys=[host_id])
    bookings = relationship("Booking", back_populates="property")
    reviews = relationship("Review", back_populates="property")
    favorites = relationship("Favorite", back_populates="property")
