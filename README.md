# Sistema de Alquiler de Propiedades tipo Airbnb (FastAPI + React)
Sistema completo de reserva de alojamientos con API REST segura, portal de huéspedes, panel de anfitriones y módulos operativos.

---

## ✅ Descripción
Plataforma web estilo Airbnb con backend Python 3.11 + FastAPI, autenticación JWT, base de datos PostgreSQL y frontend React 18 con diseño moderno inspirado en Airbnb. Soporta roles de huésped, anfitrión y administrador.

---

## ✨ Características Principales

| Característica | Descripción |
|----------------|-------------|
| **propiedades** | Módulo operativo — publicar, buscar y visualizar alojamientos |
| **reservas** | Módulo operativo — calendario, precio automático, confirmación |
| **reseñas** | Módulo operativo — rating por categorías y respuesta del anfitrión |
| **favoritos** | Módulo operativo — guardar propiedades favoritas |
| **dashboard** | Módulo operativo — panel de host y admin con estadísticas |
| **usuarios** | Módulo operativo — gestión de roles y perfiles |

---

## 📦 Módulos

- **propiedades** — CRUD completo, filtros por ciudad/tipo/precio, galería de imágenes, amenidades
- **reservas** — Creación con cálculo automático de precio, estados, código de confirmación
- **reseñas** — Rating global y por categoría (limpieza, comunicación, ubicación, valor)
- **favoritos** — Toggle de favoritos por usuario con lista personalizada
- **dashboard** — Panel de host con métricas, lista de reservas y gestión de propiedades
- **admin** — Panel completo con usuarios, todas las propiedades y reservas del sistema

---

## 📑 Entidades

- **User** (GUEST, HOST, ADMIN)
- **Property** (con amenidades, galería, geolocalización)
- **Booking** (con desglose de precios y método de pago)
- **Review** (rating por 4 categorías + respuesta del host)
- **Favorite**

---

## ⚙️ Funciones

- **Autenticación JWT** con 3 roles (GUEST, HOST, ADMIN)
- **Búsqueda avanzada** por ciudad, tipo, precio, huéspedes, habitaciones
- **Preview de precio** (noche × noches + tarifa 12% + impuesto 10%)
- **Disponibilidad en tiempo real** — no permite reservas solapadas
- **Órdenes de reserva** con código de confirmación único
- **Favoritos** — guardar y gestionar propiedades favoritas
- **Reseñas multi-criterio** con respuesta del anfitrión
- **Dashboard host** con estadísticas, gráficos y CRUD de propiedades
- **Panel admin** con gestión completa de usuarios, propiedades y reservas
- **Datos semilla** automáticos al iniciar (12 propiedades, 5 usuarios, reservas y reseñas)
- **API documentada** con Swagger UI interactivo

---

## 🧰 Stack Tecnológico

- Python 3.11 + FastAPI
- JWT (python-jose) + Passlib bcrypt
- SQLAlchemy 2.0 + PostgreSQL
- React 18 + React Router 6
- Recharts (gráficos de barras)
- React Icons + React Hot Toast
- date-fns (manejo de fechas)
- Docker + Docker Compose
- Nginx (servidor frontend con proxy reverso)

---

## 🏗️ Arquitectura

Separación por capas y módulos:
1. **Backend:** routers, models, schemas, core (config, database, security)
2. **Frontend:** pages, components (layout, common), services, hooks, styles
3. **Infra:** Docker y Docker Compose con PostgreSQL y volúmenes persistentes

---

## ✅ Instalación y Uso

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Swagger Docs: http://localhost:8000/api/docs

---

## 🔐 Credenciales de Prueba

| Usuario | Contraseña | Rol | Descripción |
|---------|------------|-----|-------------|
| `admin@stayhub.com` | `admin123` | ADMIN | Panel completo, todos los datos |
| `maria@host.com` | `host123` | HOST | Anfitriona con propiedades publicadas |
| `carlos@host.com` | `host123` | HOST | Segundo anfitrión con propiedades |
| `ana@guest.com` | `guest123` | GUEST | Huésped con reservas y favoritos |
| `pedro@guest.com` | `guest123` | GUEST | Huésped estándar |

---

## 🔌 API REST

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/me`
- `GET /api/properties/`
- `GET /api/properties/featured`
- `GET /api/properties/my`
- `POST /api/properties/`
- `GET /api/properties/{id}`
- `PUT /api/properties/{id}`
- `DELETE /api/properties/{id}`
- `POST /api/properties/{id}/favorite`
- `GET /api/properties/favorites/list`
- `POST /api/bookings/`
- `GET /api/bookings/my`
- `GET /api/bookings/host`
- `GET /api/bookings/{id}`
- `PUT /api/bookings/{id}`
- `GET /api/bookings/preview`
- `GET /api/bookings/availability/{property_id}`
- `GET /api/bookings/stats/dashboard`
- `GET /api/reviews/property/{prop_id}`
- `POST /api/reviews/`
- `PUT /api/reviews/{id}`
- `DELETE /api/reviews/{id}`
- `GET /api/users/`
- `GET /api/users/{id}`
- `PUT /api/users/{id}`

---

## 📁 Estructura del Proyecto

```
stayhub/
├── docker-compose.yml
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   └── security.py
│   ├── models/
│   │   ├── user.py
│   │   ├── property.py
│   │   ├── booking.py
│   │   └── review.py
│   ├── schemas/
│   │   ├── user.py
│   │   ├── property.py
│   │   ├── booking.py
│   │   └── review.py
│   └── routers/
│       ├── auth.py
│       ├── properties.py
│       ├── bookings.py
│       ├── reviews.py
│       └── users.py
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    └── src/
        ├── App.js
        ├── index.js
        ├── styles/globals.css
        ├── services/api.js
        ├── hooks/useAuth.js
        ├── components/
        │   ├── layout/
        │   │   ├── Navbar.jsx
        │   │   └── Footer.jsx
        │   └── common/
        │       ├── PropertyCard.jsx
        │       └── StarRating.jsx
        └── pages/
            ├── auth/Auth.jsx
            ├── home/Home.jsx
            ├── properties/PropertyDetail.jsx
            ├── bookings/
            │   ├── MyBookings.jsx
            │   └── Favorites.jsx
            └── dashboard/Dashboard.jsx
```

---

## 👨‍💻 Desarrollado por Isaac Esteban Haro Torres
Ingeniero en Sistemas - Full Stack - Automatización - Data

- Email: zackharo1@gmail.com
- WhatsApp: 098805517
- GitHub: https://github.com/ieharo1
- Portafolio: https://ieharo1.github.io/portafolio-isaac.haro/

---

© 2026 Isaac Esteban Haro Torres - Todos los derechos reservados.
