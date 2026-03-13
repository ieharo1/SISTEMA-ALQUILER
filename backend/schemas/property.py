from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from models.property import TipoEnum, EstadoEnum

class PropertyCreate(BaseModel):
    titulo: str
    descripcion: Optional[str] = None
    tipo: TipoEnum = TipoEnum.APARTAMENTO
    ciudad: str
    pais: str = "Ecuador"
    direccion: Optional[str] = None
    latitud: Optional[float] = None
    longitud: Optional[float] = None
    precio_noche: float
    max_huespedes: int = 2
    habitaciones: int = 1
    camas: int = 1
    banos: int = 1
    imagen_principal: Optional[str] = None
    imagenes: List[str] = []
    amenidades: List[str] = []

class PropertyUpdate(BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    tipo: Optional[TipoEnum] = None
    estado: Optional[EstadoEnum] = None
    ciudad: Optional[str] = None
    pais: Optional[str] = None
    direccion: Optional[str] = None
    precio_noche: Optional[float] = None
    max_huespedes: Optional[int] = None
    habitaciones: Optional[int] = None
    camas: Optional[int] = None
    banos: Optional[int] = None
    imagen_principal: Optional[str] = None
    imagenes: Optional[List[str]] = None
    amenidades: Optional[List[str]] = None

class PropertyResponse(BaseModel):
    id: int
    host_id: int
    titulo: str
    descripcion: Optional[str]
    tipo: TipoEnum
    estado: EstadoEnum
    pais: str
    ciudad: str
    direccion: Optional[str]
    latitud: Optional[float]
    longitud: Optional[float]
    precio_noche: float
    max_huespedes: int
    habitaciones: int
    camas: int
    banos: int
    imagen_principal: Optional[str]
    imagenes: List[str]
    amenidades: List[str]
    rating_promedio: float
    total_reviews: int
    total_bookings: int
    created_at: datetime
    host_name: Optional[str] = None
    host_avatar: Optional[str] = None
    is_favorite: Optional[bool] = False

    class Config:
        from_attributes = True

class PropertySearch(BaseModel):
    ciudad: Optional[str] = None
    tipo: Optional[TipoEnum] = None
    precio_min: Optional[float] = None
    precio_max: Optional[float] = None
    max_huespedes: Optional[int] = None
    habitaciones: Optional[int] = None
    check_in: Optional[str] = None
    check_out: Optional[str] = None
