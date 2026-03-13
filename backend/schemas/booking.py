from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from models.booking import EstadoBookingEnum, MetodoPagoEnum

class BookingCreate(BaseModel):
    property_id: int
    check_in: date
    check_out: date
    num_huespedes: int = 1
    metodo_pago: MetodoPagoEnum = MetodoPagoEnum.TARJETA
    notas_huesped: Optional[str] = None

class BookingUpdate(BaseModel):
    estado: Optional[EstadoBookingEnum] = None
    notas_host: Optional[str] = None
    motivo_cancelacion: Optional[str] = None

class BookingResponse(BaseModel):
    id: int
    guest_id: int
    property_id: int
    check_in: date
    check_out: date
    num_huespedes: int
    noches: int
    precio_noche: float
    subtotal: float
    tarifa_servicio: float
    impuestos: float
    total: float
    estado: EstadoBookingEnum
    metodo_pago: MetodoPagoEnum
    notas_huesped: Optional[str]
    notas_host: Optional[str]
    codigo_confirmacion: Optional[str]
    motivo_cancelacion: Optional[str]
    created_at: datetime
    # Related
    property_titulo: Optional[str] = None
    property_imagen: Optional[str] = None
    property_ciudad: Optional[str] = None
    guest_name: Optional[str] = None
    guest_email: Optional[str] = None
    has_review: bool = False

    class Config:
        from_attributes = True

class BookingAvailabilityCheck(BaseModel):
    property_id: int
    check_in: date
    check_out: date

class BookingPricePreview(BaseModel):
    noches: int
    precio_noche: float
    subtotal: float
    tarifa_servicio: float
    impuestos: float
    total: float
