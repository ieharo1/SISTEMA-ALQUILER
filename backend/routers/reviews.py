from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from core.security import get_current_active_user
from models.review import Review
from models.property import Property
from schemas.review import ReviewCreate, ReviewUpdate, ReviewResponse

router = APIRouter(prefix="/api/reviews", tags=["Reseñas"])

def build_review(r: Review) -> dict:
    return {
        **{c.name: getattr(r, c.name) for c in r.__table__.columns},
        "author_name": r.author.full_name if r.author else None,
        "author_avatar": r.author.avatar_url if r.author else None,
    }

def update_property_rating(db, prop_id):
    reviews = db.query(Review).filter(Review.property_id == prop_id).all()
    if reviews:
        avg = sum(r.rating for r in reviews) / len(reviews)
        db.query(Property).filter(Property.id == prop_id).update({
            "rating_promedio": round(avg, 2),
            "total_reviews": len(reviews),
        })
    else:
        db.query(Property).filter(Property.id == prop_id).update({"rating_promedio": 0, "total_reviews": 0})

@router.get("/property/{prop_id}", response_model=List[ReviewResponse])
def property_reviews(prop_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.property_id == prop_id).order_by(Review.created_at.desc()).all()
    return [build_review(r) for r in reviews]

@router.post("/", response_model=ReviewResponse, status_code=201)
def create_review(data: ReviewCreate, db: Session = Depends(get_db), current_user=Depends(get_current_active_user)):
    existing = db.query(Review).filter(Review.property_id == data.property_id, Review.author_id == current_user.id).first()
    if existing:
        raise HTTPException(400, "Ya dejaste una reseña para esta propiedad")
    if not 1 <= data.rating <= 5:
        raise HTTPException(400, "Rating debe ser entre 1 y 5")
    review = Review(author_id=current_user.id, **data.model_dump())
    db.add(review); db.commit(); db.refresh(review)
    update_property_rating(db, data.property_id); db.commit()
    review = db.query(Review).filter(Review.id == review.id).first()
    return build_review(review)

@router.put("/{review_id}", response_model=ReviewResponse)
def respond_review(review_id: int, data: ReviewUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_active_user)):
    r = db.query(Review).filter(Review.id == review_id).first()
    if not r:
        raise HTTPException(404)
    prop = db.query(Property).filter(Property.id == r.property_id).first()
    if prop.host_id != current_user.id:
        raise HTTPException(403, "Solo el anfitrión puede responder")
    r.respuesta_host = data.respuesta_host
    db.commit(); db.refresh(r)
    return build_review(r)

@router.delete("/{review_id}", status_code=204)
def delete_review(review_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_active_user)):
    r = db.query(Review).filter(Review.id == review_id).first()
    if not r:
        raise HTTPException(404)
    from models.user import RolEnum
    if r.author_id != current_user.id and current_user.rol != RolEnum.ADMIN:
        raise HTTPException(403)
    prop_id = r.property_id
    db.delete(r); db.commit()
    update_property_rating(db, prop_id); db.commit()
