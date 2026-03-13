import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { propertiesAPI, bookingsAPI, reviewsAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { StarRating, Stars } from '../../components/common/StarRating';
import { MdStar, MdPerson, MdBed, MdBathtub, MdGroup, MdVerified, MdShare, MdFavorite, MdFavoriteBorder, MdPlace } from 'react-icons/md';
import toast from 'react-hot-toast';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

const AMENITY_ICONS = { 'WiFi': '📶', 'Piscina': '🏊', 'Estacionamiento': '🚗', 'Aire acondicionado': '❄️', 'Cocina equipada': '🍳', 'TV': '📺', 'Lavadora': '🧺', 'Balcón': '🏞️', 'Jardín': '🌿', 'Barbacoa': '🔥', 'Gimnasio': '🏋️', 'Recepción 24h': '🕐', 'Desayuno incluido': '☕', 'Mascotas permitidas': '🐾', 'Vista al mar': '🌊', 'Jacuzzi': '🛁', 'Sauna': '♨️', 'Seguridad 24h': '🔒', 'Restaurante': '🍽️', 'Bar': '🍸' };

function ReviewModal({ propId, onClose, onSaved }) {
  const [form, setForm] = useState({ rating: 5, rating_limpieza: 5, rating_comunicacion: 5, rating_ubicacion: 5, rating_valor: 5, comentario: '' });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await reviewsAPI.create({ ...form, property_id: propId });
      toast.success('¡Reseña publicada!');
      onSaved();
    } catch (err) { toast.error(err.response?.data?.detail || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header"><h3>Dejar una reseña</h3><button className="modal-close" onClick={onClose}>×</button></div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group"><label className="form-label">Puntuación general</label><StarRating value={form.rating} onChange={v => set('rating', v)} size={32} /></div>
            <div className="form-row">
              {[['rating_limpieza','Limpieza'],['rating_comunicacion','Comunicación'],['rating_ubicacion','Ubicación'],['rating_valor','Valor']].map(([k,l]) => (
                <div key={k} className="form-group">
                  <label className="form-label">{l}</label>
                  <StarRating value={form[k]} onChange={v => set(k, v)} size={20} />
                </div>
              ))}
            </div>
            <div className="form-group">
              <label className="form-label">Tu experiencia</label>
              <textarea className="form-control" rows={4} value={form.comentario} onChange={e => set('comentario', e.target.value)} placeholder="Cuéntanos cómo fue tu estancia..." required />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Publicando...' : 'Publicar reseña'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuth } = useAuth();
  const [prop, setProp] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const [booking, setBooking] = useState({ check_in: '', check_out: '', num_huespedes: 1, metodo_pago: 'TARJETA', notas_huesped: '' });
  const [preview, setPreview] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    Promise.all([propertiesAPI.get(id), reviewsAPI.list(id)])
      .then(([pr, rv]) => {
        setProp(pr.data); setIsFav(pr.data.is_favorite); setReviews(rv.data);
      }).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (booking.check_in && booking.check_out && prop) {
      const noches = differenceInDays(new Date(booking.check_out), new Date(booking.check_in));
      if (noches > 0) {
        bookingsAPI.preview({ property_id: id, check_in: booking.check_in, check_out: booking.check_out })
          .then(r => setPreview(r.data)).catch(() => setPreview(null));
      } else setPreview(null);
    } else setPreview(null);
  }, [booking.check_in, booking.check_out, id, prop]);

  const handleFav = async () => {
    if (!isAuth) { toast.error('Debes iniciar sesión'); return; }
    try {
      const { data } = await propertiesAPI.toggleFav(id);
      setIsFav(data.is_favorite);
      toast.success(data.is_favorite ? 'Guardado en favoritos' : 'Eliminado de favoritos');
    } catch { toast.error('Error'); }
  };

  const handleBook = async () => {
    if (!isAuth) { toast.error('Debes iniciar sesión'); navigate('/login'); return; }
    if (!booking.check_in || !booking.check_out) { toast.error('Selecciona las fechas'); return; }
    setBookingLoading(true);
    try {
      await bookingsAPI.create({ ...booking, property_id: +id, num_huespedes: +booking.num_huespedes });
      toast.success('¡Reserva confirmada!');
      navigate('/mis-reservas');
    } catch (err) { toast.error(err.response?.data?.detail || 'Error al reservar'); }
    finally { setBookingLoading(false); }
  };

  if (loading) return <><Navbar /><div className="spinner" /></>;
  if (!prop) return <><Navbar /><div className="container"><p>Propiedad no encontrada</p></div></>;

  const imgs = prop.imagenes?.length ? prop.imagenes : [prop.imagen_principal].filter(Boolean);
  const TIPOS = { HOTEL: '🏨 Hotel', APARTAMENTO: '🏢 Apartamento', CASA: '🏡 Casa', VILLA: '🏖️ Villa', CABAÑA: '🌲 Cabaña', HOSTAL: '🛏️ Hostal' };

  return (
    <>
      <Navbar />
      <div className="container" style={{ paddingTop: 28 }}>
        {/* Title */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>{prop.titulo}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', fontSize: 14 }}>
            {prop.rating_promedio > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                <MdStar style={{ color: '#FF385C' }} /> {prop.rating_promedio.toFixed(1)} · {prop.total_reviews} reseñas
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#484848' }}>
              <MdPlace style={{ color: '#FF385C' }} /> {prop.ciudad}, {prop.pais}
            </span>
            <span style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
              <button className="btn btn-ghost" onClick={handleFav} style={{ display: 'flex', alignItems: 'center', gap: 6, color: isFav ? '#FF385C' : '#222' }}>
                {isFav ? <MdFavorite /> : <MdFavoriteBorder />} {isFav ? 'Guardado' : 'Guardar'}
              </button>
            </span>
          </div>
        </div>

        {/* Gallery */}
        <div className="property-gallery" style={{ marginBottom: 32 }}>
          <div className="gallery-main" style={{ borderRadius: 12, overflow: 'hidden' }}>
            {imgs[activeImg] ? <img src={imgs[activeImg]} alt={prop.titulo} style={{ width: '100%', height: '480px', objectFit: 'cover' }} /> : <div className="img-placeholder" style={{ height: '480px' }}>🏠</div>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {imgs.slice(1, 3).map((img, i) => (
              <div key={i} className="gallery-thumb" style={{ cursor: 'pointer', borderRadius: 12, overflow: 'hidden', height: 232 }} onClick={() => setActiveImg(i+1)}>
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Thumbnails */}
        {imgs.length > 1 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
            {imgs.map((img, i) => (
              <img key={i} src={img} alt="" onClick={() => setActiveImg(i)}
                style={{ width: 70, height: 56, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: activeImg === i ? '3px solid #FF385C' : '3px solid transparent', opacity: activeImg === i ? 1 : 0.7 }} />
            ))}
          </div>
        )}

        {/* Detail layout */}
        <div className="detail-layout">
          {/* Left */}
          <div>
            {/* Host */}
            <div className="detail-host">
              <div className="host-info">
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#FF385C', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 18 }}>
                  {prop.host_avatar
                    ? <img src={prop.host_avatar} alt={prop.host_name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    : prop.host_name?.[0]?.toUpperCase()
                  }
                </div>
                <div>
                  <div className="host-name">{TIPOS[prop.tipo] || prop.tipo} · Anfitrión: {prop.host_name}</div>
                  <div className="host-since">Hasta {prop.max_huespedes} huéspedes · {prop.habitaciones} hab. · {prop.camas} camas · {prop.banos} baños</div>
                </div>
              </div>
              <MdVerified style={{ fontSize: 28, color: '#00a699' }} />
            </div>

            {/* Key features */}
            <div style={{ padding: '24px 0', borderBottom: '1px solid #EBEBEB', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { icon: '🏡', title: 'Propiedad completa', desc: 'Tendrás el lugar solo para ti' },
                { icon: '✨', title: 'Limpieza a fondo', desc: 'Se desinfecta entre cada estancia' },
                { icon: '📱', title: 'Check-in flexible', desc: 'Coordinación directa con el anfitrión' },
              ].map(f => (
                <div key={f.title} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{f.icon}</span>
                  <div><div style={{ fontWeight: 700 }}>{f.title}</div><div style={{ fontSize: 13, color: '#767676' }}>{f.desc}</div></div>
                </div>
              ))}
            </div>

            {/* Description */}
            {prop.descripcion && (
              <div style={{ padding: '24px 0', borderBottom: '1px solid #EBEBEB' }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Acerca de este alojamiento</h2>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: '#484848' }}>{prop.descripcion}</p>
              </div>
            )}

            {/* Amenidades */}
            {prop.amenidades?.length > 0 && (
              <div style={{ padding: '24px 0', borderBottom: '1px solid #EBEBEB' }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>¿Qué ofrece este alojamiento?</h2>
                <div className="amenities-grid">
                  {prop.amenidades.map(a => (
                    <div key={a} className="amenity-item">
                      <span style={{ fontSize: 22 }}>{AMENITY_ICONS[a] || '✓'}</span>
                      {a}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div style={{ padding: '24px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800 }}>
                  {prop.rating_promedio > 0 && <><MdStar style={{ color: '#FF385C', verticalAlign: 'middle' }} /> {prop.rating_promedio.toFixed(1)} · </>}
                  {prop.total_reviews} reseñas
                </h2>
                {isAuth && user?.id !== prop.host_id && (
                  <button className="btn btn-outline btn-sm" onClick={() => setShowReviewModal(true)}>+ Dejar reseña</button>
                )}
              </div>

              {reviews.length === 0 ? (
                <p style={{ color: '#767676', fontSize: 14 }}>Aún no hay reseñas. ¡Sé el primero!</p>
              ) : reviews.map(r => (
                <div key={r.id} className="review-card">
                  <div className="review-header">
                    <div className="reviewer-avatar" style={{ background: '#FF385C' }}>
                      {r.author_avatar ? <img src={r.author_avatar} alt={r.author_name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : r.author_name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="reviewer-name">{r.author_name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Stars rating={r.rating} />
                        <span className="review-date">{new Date(r.created_at).toLocaleDateString('es-EC', { month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                  {r.comentario && <p className="review-text">{r.comentario}</p>}
                  {r.respuesta_host && (
                    <div className="review-response">
                      <div className="review-response-label">Respuesta del anfitrión</div>
                      <p style={{ fontSize: 13, lineHeight: 1.6 }}>{r.respuesta_host}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Booking Widget */}
          <div>
            <div className="booking-widget">
              <div className="booking-widget-price">
                ${prop.precio_noche.toFixed(0)} <span>/ noche</span>
                {prop.rating_promedio > 0 && (
                  <span style={{ fontSize: 13, marginLeft: 16, fontWeight: 600 }}>
                    <MdStar style={{ color: '#FF385C', verticalAlign: 'middle', fontSize: 14 }} /> {prop.rating_promedio.toFixed(1)}
                  </span>
                )}
              </div>

              <div className="date-inputs">
                <div className="date-field">
                  <label>Llegada</label>
                  <input type="date" min={new Date().toISOString().split('T')[0]} value={booking.check_in} onChange={e => setBooking(b => ({ ...b, check_in: e.target.value }))} />
                </div>
                <div className="date-field">
                  <label>Salida</label>
                  <input type="date" min={booking.check_in || new Date().toISOString().split('T')[0]} value={booking.check_out} onChange={e => setBooking(b => ({ ...b, check_out: e.target.value }))} />
                </div>
              </div>

              <div className="guests-field">
                <label>Huéspedes</label>
                <select value={booking.num_huespedes} onChange={e => setBooking(b => ({ ...b, num_huespedes: e.target.value }))}>
                  {[...Array(prop.max_huespedes)].map((_, i) => (
                    <option key={i+1} value={i+1}>{i+1} {i === 0 ? 'huésped' : 'huéspedes'}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label className="form-label" style={{ fontSize: 12 }}>Método de pago</label>
                <select className="form-control" value={booking.metodo_pago} onChange={e => setBooking(b => ({ ...b, metodo_pago: e.target.value }))}>
                  <option value="TARJETA">💳 Tarjeta de crédito</option>
                  <option value="TRANSFERENCIA">🏦 Transferencia</option>
                  <option value="EFECTIVO">💵 Efectivo</option>
                  <option value="PAYPAL">🅿️ PayPal</option>
                </select>
              </div>

              <button
                className="btn btn-primary btn-full btn-lg"
                onClick={handleBook}
                disabled={bookingLoading || !booking.check_in || !booking.check_out}
              >
                {bookingLoading ? 'Reservando...' : 'Reservar'}
              </button>
              <p style={{ textAlign: 'center', fontSize: 12, color: '#767676', marginTop: 8 }}>No se te cobrará todavía</p>

              {preview && (
                <div className="price-breakdown">
                  <div className="price-row">
                    <span>${prop.precio_noche.toFixed(0)} × {preview.noches} noches</span>
                    <span>${preview.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="price-row">
                    <span>Tarifa de servicio (12%)</span>
                    <span>${preview.tarifa_servicio.toFixed(2)}</span>
                  </div>
                  <div className="price-row">
                    <span>Impuestos (10%)</span>
                    <span>${preview.impuestos.toFixed(2)}</span>
                  </div>
                  <div className="price-row total">
                    <span>Total</span>
                    <span>${preview.total.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showReviewModal && (
        <ReviewModal propId={id} onClose={() => setShowReviewModal(false)} onSaved={() => { setShowReviewModal(false); reviewsAPI.list(id).then(r => setReviews(r.data)); propertiesAPI.get(id).then(r => setProp(r.data)); }} />
      )}
      <Footer />
    </>
  );
}
