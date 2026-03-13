from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from core.database import get_db
from core.security import get_current_active_user, get_optional_user, require_host
from models.property import Property, EstadoEnum
from models.review import Favorite
from schemas.property import PropertyCreate, PropertyUpdate, PropertyResponse

router = APIRouter(prefix="/api/properties", tags=["Propiedades"])

def build_prop(p: Property, current_user=None, db: Session = None) -> dict:
    is_fav = False
    if current_user and db:
        is_fav = db.query(Favorite).filter(Favorite.user_id == current_user.id, Favorite.property_id == p.id).first() is not None
    return {
        **{c.name: getattr(p, c.name) for c in p.__table__.columns},
        "host_name": p.host.full_name if p.host else None,
        "host_avatar": p.host.avatar_url if p.host else None,
        "is_favorite": is_fav,
    }

@router.get("/", response_model=List[PropertyResponse])
def list_properties(
    ciudad: Optional[str] = None,
    tipo: Optional[str] = None,
    precio_min: Optional[float] = None,
    precio_max: Optional[float] = None,
    max_huespedes: Optional[int] = None,
    habitaciones: Optional[int] = None,
    skip: int = 0, limit: int = 24,
    db: Session = Depends(get_db),
    current_user=Depends(get_optional_user),
):
    q = db.query(Property).options(joinedload(Property.host)).filter(Property.estado == EstadoEnum.ACTIVO)
    if ciudad:
        q = q.filter(Property.ciudad.ilike(f"%{ciudad}%"))
    if tipo:
        q = q.filter(Property.tipo == tipo)
    if precio_min is not None:
        q = q.filter(Property.precio_noche >= precio_min)
    if precio_max is not None:
        q = q.filter(Property.precio_noche <= precio_max)
    if max_huespedes:
        q = q.filter(Property.max_huespedes >= max_huespedes)
    if habitaciones:
        q = q.filter(Property.habitaciones >= habitaciones)
    props = q.order_by(Property.rating_promedio.desc(), Property.id.desc()).offset(skip).limit(limit).all()
    return [build_prop(p, current_user, db) for p in props]

@router.get("/featured", response_model=List[PropertyResponse])
def featured(db: Session = Depends(get_db), current_user=Depends(get_optional_user)):
    props = db.query(Property).options(joinedload(Property.host)).filter(Property.estado == EstadoEnum.ACTIVO).order_by(Property.rating_promedio.desc(), Property.total_bookings.desc()).limit(8).all()
    return [build_prop(p, current_user, db) for p in props]

@router.get("/my", response_model=List[PropertyResponse])
def my_properties(db: Session = Depends(get_db), current_user=Depends(require_host)):
    props = db.query(Property).options(joinedload(Property.host)).filter(Property.host_id == current_user.id).order_by(Property.id.desc()).all()
    return [build_prop(p, current_user, db) for p in props]

@router.get("/{prop_id}", response_model=PropertyResponse)
def get_property(prop_id: int, db: Session = Depends(get_db), current_user=Depends(get_optional_user)):
    p = db.query(Property).options(joinedload(Property.host)).filter(Property.id == prop_id).first()
    if not p:
        raise HTTPException(404, "Propiedad no encontrada")
    return build_prop(p, current_user, db)

@router.post("/", response_model=PropertyResponse, status_code=201)
def create_property(data: PropertyCreate, db: Session = Depends(get_db), current_user=Depends(require_host)):
    p = Property(**data.model_dump(), host_id=current_user.id)
    db.add(p); db.commit(); db.refresh(p)
    p = db.query(Property).options(joinedload(Property.host)).filter(Property.id == p.id).first()
    return build_prop(p, current_user, db)

@router.put("/{prop_id}", response_model=PropertyResponse)
def update_property(prop_id: int, data: PropertyUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_active_user)):
    p = db.query(Property).filter(Property.id == prop_id).first()
    if not p:
        raise HTTPException(404, "Propiedad no encontrada")
    from models.user import RolEnum
    if p.host_id != current_user.id and current_user.rol != RolEnum.ADMIN:
        raise HTTPException(403, "Sin permiso")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(p, k, v)
    db.commit(); db.refresh(p)
    p = db.query(Property).options(joinedload(Property.host)).filter(Property.id == p.id).first()
    return build_prop(p, current_user, db)

@router.delete("/{prop_id}", status_code=204)
def delete_property(prop_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_active_user)):
    p = db.query(Property).filter(Property.id == prop_id).first()
    if not p:
        raise HTTPException(404)
    from models.user import RolEnum
    if p.host_id != current_user.id and current_user.rol != RolEnum.ADMIN:
        raise HTTPException(403)
    p.estado = EstadoEnum.INACTIVO
    db.commit()

@router.post("/{prop_id}/favorite")
def toggle_favorite(prop_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_active_user)):
    fav = db.query(Favorite).filter(Favorite.user_id == current_user.id, Favorite.property_id == prop_id).first()
    if fav:
        db.delete(fav); db.commit()
        return {"is_favorite": False}
    else:
        db.add(Favorite(user_id=current_user.id, property_id=prop_id)); db.commit()
        return {"is_favorite": True}

@router.get("/favorites/list", response_model=List[PropertyResponse])
def my_favorites(db: Session = Depends(get_db), current_user=Depends(get_current_active_user)):
    favs = db.query(Favorite).filter(Favorite.user_id == current_user.id).all()
    prop_ids = [f.property_id for f in favs]
    props = db.query(Property).options(joinedload(Property.host)).filter(Property.id.in_(prop_ids)).all()
    return [build_prop(p, current_user, db) for p in props]
