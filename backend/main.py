from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import time, os, json, random
from sqlalchemy import text
from core.database import engine, init_db, SessionLocal
from core.security import get_password_hash
from routers import auth, properties, bookings, reviews, users

app = FastAPI(
    title="StayHub - Plataforma de Alquiler",
    description="API REST para plataforma de alquiler tipo Airbnb",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(properties.router)
app.include_router(bookings.router)
app.include_router(reviews.router)
app.include_router(users.router)

UPLOAD_DIR = "/app/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

CITY_IMAGES = {
    "Quito":       ["https://images.unsplash.com/photo-1575986767340-5d17ae767f52?w=800","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800","https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"],
    "Guayaquil":   ["https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800","https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800","https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800"],
    "Cuenca":      ["https://images.unsplash.com/photo-1611048267451-e6ed903f4f53?w=800","https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800","https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800"],
    "Manta":       ["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800","https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800","https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"],
    "Baños":       ["https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800","https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800","https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800"],
    "Salinas":     ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800","https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800","https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800"],
}

AMENIDADES_POOL = ["WiFi","Piscina","Estacionamiento","Aire acondicionado","Cocina equipada","TV","Lavadora","Balcón","Jardín","Barbacoa","Gimnasio","Recepción 24h","Desayuno incluido","Mascotas permitidas","Vista al mar","Jacuzzi","Sauna","Seguridad 24h","Restaurante","Bar"]

PROP_DATA = [
    ("Suite Ejecutiva Centro Histórico", "Quito", "HOTEL", 120, 4, 2, 2, 2, ["WiFi","Recepción 24h","Desayuno incluido","Gimnasio","Bar"], 4.9, "Lujosa suite en el corazón del centro histórico con vista panorámica a las iglesias coloniales."),
    ("Apartamento Moderno Polanco", "Quito", "APARTAMENTO", 75, 3, 2, 1, 1, ["WiFi","Cocina equipada","Estacionamiento","TV","Lavadora"], 4.7, "Apartamento completamente equipado en zona residencial exclusiva, a 5 min del parque La Carolina."),
    ("Casa Colonial con Jardín", "Cuenca", "CASA", 95, 6, 3, 3, 2, ["WiFi","Jardín","Barbacoa","Estacionamiento","Cocina equipada","Mascotas permitidas"], 4.8, "Auténtica casa colonial restaurada con jardín privado. A pasos del centro histórico Patrimonio UNESCO."),
    ("Villa Frente al Mar", "Salinas", "VILLA", 280, 8, 4, 6, 3, ["Piscina","WiFi","Barbacoa","Estacionamiento","Vista al mar","Jacuzzi","TV","Cocina equipada"], 5.0, "Villa exclusiva con acceso directo a la playa y piscina privada. Perfecta para familias o grupos."),
    ("Cabaña en la Montaña", "Baños", "CABAÑA", 60, 4, 2, 2, 1, ["WiFi","Cocina equipada","Barbacoa","Vista al mar","Jardín"], 4.6, "Romántica cabaña rodeada de naturaleza con vistas a la cascada. Ideal para escapadas de aventura."),
    ("Hotel Boutique Malecón", "Guayaquil", "HOTEL", 150, 2, 1, 1, 1, ["WiFi","Recepción 24h","Restaurante","Bar","Gimnasio","Aire acondicionado"], 4.8, "Hotel boutique de lujo frente al famoso Malecón 2000. Vistas espectaculares al Río Guayas."),
    ("Penthouse con Terraza 360°", "Guayaquil", "APARTAMENTO", 200, 4, 2, 2, 2, ["WiFi","Piscina","Estacionamiento","Gimnasio","TV","Aire acondicionado","Balcón"], 4.9, "Impresionante penthouse en el piso 32 con terraza privada y vistas panorámicas de la ciudad."),
    ("Hostal Mochilero Céntrico", "Quito", "HOSTAL", 25, 2, 1, 2, 1, ["WiFi","Cocina equipada","TV"], 4.3, "Acogedor hostal en la Mariscal. Ambiente internacional, perfecto para viajeros con presupuesto ajustado."),
    ("Casa Frente al Mar", "Manta", "CASA", 120, 6, 3, 3, 2, ["WiFi","Vista al mar","Barbacoa","Estacionamiento","Cocina equipada","Piscina"], 4.7, "Espectacular casa con acceso privado a la playa y vista directa al Océano Pacífico desde todas las habitaciones."),
    ("Suite Spa Baños de Agua Santa", "Baños", "HOTEL", 180, 2, 1, 1, 1, ["WiFi","Sauna","Jacuzzi","Recepción 24h","Desayuno incluido","Gimnasio"], 4.9, "Hotel spa de lujo con acceso a aguas termales. La experiencia perfecta para relajarse en los Andes."),
    ("Apartamento Ejecutivo Quito Norte", "Quito", "APARTAMENTO", 85, 2, 1, 1, 1, ["WiFi","Gimnasio","Estacionamiento","TV","Aire acondicionado","Seguridad 24h"], 4.5, "Moderno apartamento ejecutivo en el sector financiero de Quito, ideal para viajes de negocios."),
    ("Bungalow Ecológico Galápagos", "Galápagos", "CABAÑA", 320, 4, 2, 2, 1, ["WiFi","Jardín","Barbacoa","Mascotas permitidas"], 4.8, "Increíble bungalow ecológico en las Islas Galápagos. Comparte el entorno con la fauna única del mundo."),
]

def wait_for_db(retries=12, delay=4):
    for i in range(retries):
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print("✅ Base de datos conectada")
            return True
        except Exception as e:
            print(f"⏳ Esperando DB ({i+1}/{retries}): {e}")
            time.sleep(delay)
    return False

def seed():
    db = SessionLocal()
    try:
        from models.user import User, RolEnum
        from models.property import Property
        from models.booking import Booking, EstadoBookingEnum, MetodoPagoEnum
        from models.review import Review
        from datetime import date, timedelta

        if db.query(User).count() > 0:
            return
        print("🌱 Insertando datos de ejemplo...")

        # Users
        admin = User(email="admin@stayhub.com", full_name="Admin StayHub", rol=RolEnum.ADMIN, hashed_password=get_password_hash("admin123"), is_verified=True, bio="Administrador de la plataforma")
        host1 = User(email="maria@host.com", full_name="María González", rol=RolEnum.HOST, hashed_password=get_password_hash("host123"), is_verified=True, phone="0991234567", bio="Anfitriona con 5 años de experiencia. Amo recibir viajeros de todo el mundo.", avatar_url="https://i.pravatar.cc/150?img=47")
        host2 = User(email="carlos@host.com", full_name="Carlos Mendoza", rol=RolEnum.HOST, hashed_password=get_password_hash("host123"), is_verified=True, phone="0987654321", bio="Arquitecto y anfitrión. Mis propiedades tienen diseño único y cuidado al detalle.", avatar_url="https://i.pravatar.cc/150?img=68")
        guest1 = User(email="ana@guest.com", full_name="Ana Martínez", rol=RolEnum.GUEST, hashed_password=get_password_hash("guest123"), is_verified=True, phone="0976543210", bio="Viajera empedernida. He visitado 30 países.", avatar_url="https://i.pravatar.cc/150?img=45")
        guest2 = User(email="pedro@guest.com", full_name="Pedro Rodríguez", rol=RolEnum.GUEST, hashed_password=get_password_hash("guest123"), is_verified=True, avatar_url="https://i.pravatar.cc/150?img=12")
        db.add_all([admin, host1, host2, guest1, guest2])
        db.flush()

        hosts = [host1, host2]
        for i, (titulo, ciudad, tipo, precio, huespedes, habitaciones, camas, banos, amenidades, rating, desc) in enumerate(PROP_DATA):
            imgs = CITY_IMAGES.get(ciudad, CITY_IMAGES["Quito"])
            host = hosts[i % 2]
            prop = Property(
                host_id=host.id, titulo=titulo, descripcion=desc, tipo=tipo, ciudad=ciudad,
                pais="Ecuador", precio_noche=precio, max_huespedes=huespedes,
                habitaciones=habitaciones, camas=camas, banos=banos,
                imagen_principal=imgs[i % len(imgs)],
                imagenes=imgs, amenidades=amenidades,
                rating_promedio=rating, total_reviews=random.randint(8, 45),
                total_bookings=random.randint(10, 80),
            )
            db.add(prop)
        db.flush()

        from models.property import Property as P
        props = db.query(P).all()
        today = date.today()

        # Bookings
        booking_data = [
            (guest1.id, props[0].id, today - timedelta(days=30), today - timedelta(days=27), EstadoBookingEnum.COMPLETADA),
            (guest1.id, props[2].id, today + timedelta(days=10), today + timedelta(days=15), EstadoBookingEnum.CONFIRMADA),
            (guest2.id, props[1].id, today - timedelta(days=5), today + timedelta(days=2), EstadoBookingEnum.CONFIRMADA),
            (guest2.id, props[5].id, today + timedelta(days=20), today + timedelta(days=25), EstadoBookingEnum.PENDIENTE),
            (guest1.id, props[7].id, today - timedelta(days=60), today - timedelta(days=57), EstadoBookingEnum.COMPLETADA),
        ]
        created_bookings = []
        for guest_id, prop_id, ci, co, estado in booking_data:
            prop = next(p for p in props if p.id == prop_id)
            noches = (co - ci).days
            subtotal = prop.precio_noche * noches
            tarifa = round(subtotal * 0.12, 2)
            imp = round(subtotal * 0.10, 2)
            total = round(subtotal + tarifa + imp, 2)
            b = Booking(
                guest_id=guest_id, property_id=prop_id, check_in=ci, check_out=co,
                num_huespedes=2, noches=noches, precio_noche=prop.precio_noche,
                subtotal=subtotal, tarifa_servicio=tarifa, impuestos=imp, total=total,
                estado=estado, metodo_pago=MetodoPagoEnum.TARJETA,
                codigo_confirmacion="SH-" + "".join(random.choices("ABCDEFGHJKMNPQRSTUVWXYZ23456789", k=8)),
            )
            db.add(b); created_bookings.append(b)
        db.flush()

        # Reviews for completed bookings
        review_texts = [
            "Increíble experiencia, todo impecable. La ubicación es perfecta y el anfitrión muy atento.",
            "Muy buena estancia. La propiedad estaba limpia y bien equipada. Volvería sin dudarlo.",
            "Superó mis expectativas. Las fotos no le hacen justicia, es aún mejor en persona.",
        ]
        for i, b in enumerate([b for b in created_bookings if b.estado == EstadoBookingEnum.COMPLETADA]):
            r = Review(
                property_id=b.property_id, author_id=b.guest_id, booking_id=b.id,
                rating=4.5 + (i % 2) * 0.5, rating_limpieza=5.0, rating_comunicacion=4.8,
                rating_ubicacion=4.9, rating_valor=4.7,
                comentario=review_texts[i % len(review_texts)],
            )
            db.add(r)

        db.commit()
        print("✅ Datos de ejemplo insertados correctamente")
    except Exception as e:
        db.rollback()
        print(f"⚠️ Error en seed: {e}")
    finally:
        db.close()

@app.on_event("startup")
async def startup():
    if wait_for_db():
        init_db()
        seed()

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "StayHub API", "version": "1.0.0"}
