from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReviewCreate(BaseModel):
    property_id: int
    booking_id: Optional[int] = None
    rating: float
    rating_limpieza: float = 5.0
    rating_comunicacion: float = 5.0
    rating_ubicacion: float = 5.0
    rating_valor: float = 5.0
    comentario: Optional[str] = None

class ReviewUpdate(BaseModel):
    respuesta_host: Optional[str] = None

class ReviewResponse(BaseModel):
    id: int
    property_id: int
    author_id: int
    booking_id: Optional[int]
    rating: float
    rating_limpieza: float
    rating_comunicacion: float
    rating_ubicacion: float
    rating_valor: float
    comentario: Optional[str]
    respuesta_host: Optional[str]
    created_at: datetime
    author_name: Optional[str] = None
    author_avatar: Optional[str] = None

    class Config:
        from_attributes = True
