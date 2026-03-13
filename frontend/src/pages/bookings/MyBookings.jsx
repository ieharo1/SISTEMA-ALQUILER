import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { bookingsAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { MdCalendarToday, MdPeople, MdCancel, MdStar } from 'react-icons/md';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const estadoMap = {
  PENDIENTE: { cls: 'badge-yellow', label: 'Pendiente' },
  CONFIRMADA: { cls: 'badge-green', label: 'Confirmada' },
  CANCELADA: { cls: 'badge-red', label: 'Cancelada' },
  COMPLETADA: { cls: 'badge-blue', label: 'Completada' },
  RECHAZADA: { cls: 'badge-gray', label: 'Rechazada' },
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const { user } = useAuth();
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    bookingsAPI.my().then(r => setBookings(r.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCancel = async (id) => {
    if (!window.confirm('¿Cancelar esta reserva?')) return;
    try {
      await bookingsAPI.update(id, { estado: 'CANCELADA', motivo_cancelacion: 'Cancelado por el huésped' });
      toast.success('Reserva cancelada');
      load();
    } catch { toast.error('No se pudo cancelar'); }
  };

  const tabs = [
    { key: 'all', label: 'Todas' },
    { key: 'CONFIRMADA', label: 'Confirmadas' },
    { key: 'COMPLETADA', label: 'Completadas' },
    { key: 'CANCELADA', label: 'Canceladas' },
  ];

  const filtered = activeTab === 'all' ? bookings : bookings.filter(b => b.estado === activeTab);

  return (
    <>
      <Navbar />
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Mis reservas</h1>
        <p style={{ color: '#767676', marginBottom: 28 }}>Gestiona todas tus estancias</p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, borderBottom: '1px solid #EBEBEB', paddingBottom: 0 }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              style={{ padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, borderBottom: activeTab === t.key ? '3px solid #222' : '3px solid transparent', color: activeTab === t.key ? '#222' : '#767676', transition: 'all 0.2s', marginBottom: -1 }}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? <div className="spinner" /> : filtered.length === 0 ? (
          <div className="empty-state">
            <span style={{ fontSize: 56, display: 'block', marginBottom: 16 }}>🧳</span>
            <h3>Sin reservas</h3>
            <p style={{ marginBottom: 24 }}>¡Empieza a explorar y reserva tu próximo destino!</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>Explorar alojamientos</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {filtered.map(b => (
              <div key={b.id} className="booking-card">
                <img
                  className="booking-card-img"
                  src={b.property_imagen || 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400'}
                  alt={b.property_titulo}
                  onError={e => e.target.src = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400'}
                />
                <div className="booking-card-info">
                  <h4 style={{ cursor: 'pointer' }} onClick={() => navigate(`/propiedad/${b.property_id}`)}>{b.property_titulo}</h4>
                  <p>📍 {b.property_ciudad}</p>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13 }}>
                    <span><MdCalendarToday style={{ verticalAlign: 'middle', fontSize: 15 }} /> {new Date(b.check_in + 'T12:00:00').toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })} → {new Date(b.check_out + 'T12:00:00').toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span><MdPeople style={{ verticalAlign: 'middle', fontSize: 15 }} /> {b.num_huespedes} huésp.</span>
                    <span>{b.noches} noche{b.noches > 1 ? 's' : ''}</span>
                  </div>
                  {b.codigo_confirmacion && (
                    <div style={{ marginTop: 8, fontSize: 12, color: '#767676' }}>
                      Código: <code style={{ background: '#f7f7f7', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>{b.codigo_confirmacion}</code>
                    </div>
                  )}
                </div>
                <div className="booking-card-actions">
                  <span className={`badge ${estadoMap[b.estado]?.cls || 'badge-gray'}`}>{estadoMap[b.estado]?.label || b.estado}</span>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>${b.total.toFixed(2)}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {b.estado === 'CONFIRMADA' && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleCancel(b.id)}>Cancelar</button>
                    )}
                    {b.estado === 'COMPLETADA' && !b.has_review && (
                      <button className="btn btn-outline btn-sm" onClick={() => navigate(`/propiedad/${b.property_id}`)}>
                        <MdStar /> Reseñar
                      </button>
                    )}
                    <button className="btn btn-outline btn-sm" onClick={() => navigate(`/propiedad/${b.property_id}`)}>Ver propiedad</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
