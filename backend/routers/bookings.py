from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import date, datetime
import random, string
from core.database import get_db
from core.security import get_current_active_user
from models.booking import Booking, EstadoBookingEnum
from models.property import Property
from models.review import Review
from schemas.booking import BookingCreate, BookingUpdate, BookingResponse, BookingPricePreview

router = APIRouter(prefix="/api/bookings", tags=["Reservas"])

def gen_code():
    return "SH-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=8))

def compute_price(precio_noche: float, noches: int):
    subtotal = precio_noche * noches
    tarifa = round(subtotal * 0.12, 2)
    impuesto = round(subtotal * 0.10, 2)
    total = round(subtotal + tarifa + impuesto, 2)
    return subtotal, tarifa, impuesto, total

def check_available(db, prop_id, check_in, check_out, exclude_id=None):
    q = db.query(Booking).filter(
        Booking.property_id == prop_id,
        Booking.estado.in_([EstadoBookingEnum.CONFIRMADA, EstadoBookingEnum.PENDIENTE]),
        Booking.check_in < check_out,
        Booking.check_out > check_in,
    )
    if exclude_id:
        q = q.filter(Booking.id != exclude_id)
    return q.first() is None

def build_booking(b: Booking, db: Session) -> dict:
    has_review = db.query(Review).filter(Review.booking_id == b.id).first() is not None
    return {
        **{c.name: getattr(b, c.name) for c in b.__table__.columns},
        "property_titulo": b.property.titulo if b.property else None,
        "property_imagen": b.property.imagen_principal if b.property else None,
        "property_ciudad": b.property.ciudad if b.property else None,
        "guest_name": b.guest.full_name if b.guest else None,
        "guest_email": b.guest.email if b.guest else None,
        "has_review": has_review,
    }

@router.get("/preview")
def price_preview(property_id: int, check_in: date, check_out: date, db: Session = Depends(get_db)):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(404, "Propiedad no encontrada")
    noches = (check_out - check_in).days
    if noches <= 0:
        raise HTTPException(400, "Fechas inválidas")
    subtotal, tarifa, impuesto, total = compute_price(prop.precio_noche, noches)
    return BookingPricePreview(
        noches=noches, precio_noche=prop.precio_noche,
        subtotal=subtotal, tarifa_servicio=tarifa, impuestos=impuesto, total=total,
    )

@router.post("/", response_model=BookingResponse, status_code=201)
def create_booking(data: BookingCreate, db: Session = Depends(get_db), current_user=Depends(get_current_active_user)):
    prop = db.query(Property).filter(Property.id == data.property_id).first()
    if not prop:
        raise HTTPException(404, "Propiedad no encontrada")
    if prop.host_id == current_user.id:
        raise HTTPException(400, "No puedes reservar tu propia propiedad")
    if data.num_huespedes > prop.max_huespedes:
        raise HTTPException(400, f"Máximo {prop.max_huespedes} huéspedes")
    noches = (data.check_out - data.check_in).days
    if noches <= 0:
        raise HTTPException(400, "La fecha de salida debe ser posterior a la de entrada")
    if not check_available(db, data.property_id, data.check_in, data.check_out):
        raise HTTPException(400, "Las fechas seleccionadas no están disponibles")
    subtotal, tarifa, impuesto, total = compute_price(prop.precio_noche, noches)
    booking = Booking(
        guest_id=current_user.id,
        property_id=data.property_id,
        check_in=data.check_in,
        check_out=data.check_out,
        num_huespedes=data.num_huespedes,
        noches=noches,
        precio_noche=prop.precio_noche,
        subtotal=subtotal,
        tarifa_servicio=tarifa,
        impuestos=impuesto,
        total=total,
        metodo_pago=data.metodo_pago,
        notas_huesped=data.notas_huesped,
        codigo_confirmacion=gen_code(),
        estado=EstadoBookingEnum.CONFIRMADA,
        fecha_confirmacion=datetime.utcnow(),
    )
    db.add(booking)
    prop.total_bookings = (prop.total_bookings or 0) + 1
    db.commit(); db.refresh(booking)
    booking = db.query(Booking).options(joinedload(Booking.property), joinedload(Booking.guest)).filter(Booking.id == booking.id).first()
    return build_booking(booking, db)

@router.get("/my", response_model=List[BookingResponse])
def my_bookings(db: Session = Depends(get_db), current_user=Depends(get_current_active_user)):
    bookings = db.query(Booking).options(joinedload(Booking.property), joinedload(Booking.guest)).filter(Booking.guest_id == current_user.id).order_by(Booking.created_at.desc()).all()
    return [build_booking(b, db) for b in bookings]

@router.get("/host", response_model=List[BookingResponse])
def host_bookings(db: Session = Depends(get_db), current_user=Depends(get_current_active_user)):
    my_props = [p.id for p in current_user.properties]
    if not my_props:
        return []
    bookings = db.query(Booking).options(joinedload(Booking.property), joinedload(Booking.guest)).filter(Booking.property_id.in_(my_props)).order_by(Booking.created_at.desc()).all()
    return [build_booking(b, db) for b in bookings]

@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking(booking_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_active_user)):
    b = db.query(Booking).options(joinedload(Booking.property), joinedload(Booking.guest)).filter(Booking.id == booking_id).first()
    if not b:
        raise HTTPException(404)
    from models.user import RolEnum
    if b.guest_id != current_user.id and b.property.host_id != current_user.id and current_user.rol != RolEnum.ADMIN:
        raise HTTPException(403)
    return build_booking(b, db)

@router.put("/{booking_id}", response_model=BookingResponse)
def update_booking(booking_id: int, data: BookingUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_active_user)):
    b = db.query(Booking).options(joinedload(Booking.property), joinedload(Booking.guest)).filter(Booking.id == booking_id).first()
    if not b:
        raise HTTPException(404)
    if data.estado == EstadoBookingEnum.CANCELADA:
        b.estado = EstadoBookingEnum.CANCELADA
        b.fecha_cancelacion = datetime.utcnow()
        b.motivo_cancelacion = data.motivo_cancelacion
    elif data.estado:
        b.estado = data.estado
    if data.notas_host is not None:
        b.notas_host = data.notas_host
    db.commit(); db.refresh(b)
    b = db.query(Booking).options(joinedload(Booking.property), joinedload(Booking.guest)).filter(Booking.id == b.id).first()
    return build_booking(b, db)

@router.get("/availability/{property_id}")
def check_availability(property_id: int, check_in: date, check_out: date, db: Session = Depends(get_db)):
    available = check_available(db, property_id, check_in, check_out)
    return {"available": available, "property_id": property_id, "check_in": check_in, "check_out": check_out}

@router.get("/stats/dashboard")
def booking_stats(db: Session = Depends(get_db), current_user=Depends(get_current_active_user)):
    from sqlalchemy import func
    from models.user import RolEnum

    if current_user.rol == RolEnum.ADMIN:
        total = db.query(func.count(Booking.id)).scalar()
        confirmadas = db.query(func.count(Booking.id)).filter(Booking.estado == EstadoBookingEnum.CONFIRMADA).scalar()
        completadas = db.query(func.count(Booking.id)).filter(Booking.estado == EstadoBookingEnum.COMPLETADA).scalar()
        canceladas = db.query(func.count(Booking.id)).filter(Booking.estado == EstadoBookingEnum.CANCELADA).scalar()
        ingresos = db.query(func.sum(Booking.total)).filter(Booking.estado.in_([EstadoBookingEnum.CONFIRMADA, EstadoBookingEnum.COMPLETADA])).scalar() or 0
        total_users = db.query(func.count()).select_from(__import__("models.user", fromlist=["User"]).User).scalar()
        total_props = db.query(func.count(Property.id)).scalar()
    else:
        my_ids = [p.id for p in current_user.properties]
        total = db.query(func.count(Booking.id)).filter(Booking.property_id.in_(my_ids)).scalar() if my_ids else 0
        confirmadas = db.query(func.count(Booking.id)).filter(Booking.property_id.in_(my_ids), Booking.estado == EstadoBookingEnum.CONFIRMADA).scalar() if my_ids else 0
        completadas = db.query(func.count(Booking.id)).filter(Booking.property_id.in_(my_ids), Booking.estado == EstadoBookingEnum.COMPLETADA).scalar() if my_ids else 0
        canceladas = db.query(func.count(Booking.id)).filter(Booking.property_id.in_(my_ids), Booking.estado == EstadoBookingEnum.CANCELADA).scalar() if my_ids else 0
        ingresos = db.query(func.sum(Booking.total)).filter(Booking.property_id.in_(my_ids), Booking.estado.in_([EstadoBookingEnum.CONFIRMADA, EstadoBookingEnum.COMPLETADA])).scalar() if my_ids else 0
        total_users = None
        total_props = len(my_ids)

    return {
        "total_reservas": total,
        "confirmadas": confirmadas,
        "completadas": completadas,
        "canceladas": canceladas,
        "ingresos_totales": round(float(ingresos or 0), 2),
        "total_usuarios": total_users,
        "total_propiedades": total_props,
    }
