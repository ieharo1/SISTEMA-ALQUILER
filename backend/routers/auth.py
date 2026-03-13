from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import verify_password, get_password_hash, create_access_token, get_current_active_user
from models.user import User
from schemas.user import UserCreate, UserResponse, Token, UserLogin, UserUpdate

router = APIRouter(prefix="/api/auth", tags=["Autenticación"])

@router.post("/register", response_model=Token, status_code=201)
def register(data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(400, "El email ya está registrado")
    user = User(
        email=data.email,
        full_name=data.full_name,
        phone=data.phone,
        rol=data.rol,
        hashed_password=get_password_hash(data.password),
        is_verified=True,
    )
    db.add(user); db.commit(); db.refresh(user)
    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Email o contraseña incorrectos")
    if not user.is_active:
        raise HTTPException(400, "Cuenta desactivada")
    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=UserResponse)
def me(current_user=Depends(get_current_active_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
def update_me(data: UserUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_active_user)):
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(current_user, k, v)
    db.commit(); db.refresh(current_user)
    return current_user
