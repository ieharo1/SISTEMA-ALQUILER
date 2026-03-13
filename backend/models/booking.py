from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, Float, ForeignKey, Date, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from core.database import Base
import enum

class EstadoBookingEnum(str, enum.Enum):
    PENDIENTE = "PENDIENTE"
    CONFIRMADA = "CONFIRMADA"
    CANCELADA = "CANCELADA"
    COMPLETADA = "COMPLETADA"
    RECHAZADA = "RECHAZADA"

class MetodoPagoEnum(str, enum.Enum):
    TARJETA = "TARJETA"
    TRANSFERENCIA = "TRANSFERENCIA"
    EFECTIVO = "EFECTIVO"
    PAYPAL = "PAYPAL"

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    guest_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)

    check_in = Column(Date, nullable=False)
    check_out = Column(Date, nullable=False)
    num_huespedes = Column(Integer, default=1)

    noches = Column(Integer, nullable=False)
    precio_noche = Column(Float, nullable=False)
    subtotal = Column(Float, nullable=False)
    tarifa_servicio = Column(Float, default=0.0)
    impuestos = Column(Float, default=0.0)
    total = Column(Float, nullable=False)

    estado = Column(Enum(EstadoBookingEnum), default=EstadoBookingEnum.PENDIENTE)
    metodo_pago = Column(Enum(MetodoPagoEnum), default=MetodoPagoEnum.TARJETA)
    notas_huesped = Column(Text)
    notas_host = Column(Text)

    codigo_confirmacion = Column(String(20), unique=True)
    fecha_confirmacion = Column(DateTime(timezone=True))
    fecha_cancelacion = Column(DateTime(timezone=True))
    motivo_cancelacion = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    guest = relationship("User", back_populates="bookings", foreign_keys=[guest_id])
    property = relationship("Property", back_populates="bookings")
    review = relationship("Review", back_populates="booking", uselist=False)
