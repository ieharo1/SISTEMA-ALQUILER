import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { bookingsAPI, propertiesAPI, usersAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { MdDashboard, MdHome, MdBookmark, MdPeople, MdAdd, MdEdit, MdDelete, MdClose, MdStar, MdCheck } from 'react-icons/md';
import { FaDollarSign } from 'react-icons/fa';
import toast from 'react-hot-toast';

const TIPOS = ['HOTEL','APARTAMENTO','CASA','VILLA','CABAÑA','HOSTAL'];
const AMENIDADES_ALL = ['WiFi','Piscina','Estacionamiento','Aire acondicionado','Cocina equipada','TV','Lavadora','Balcón','Jardín','Barbacoa','Gimnasio','Recepción 24h','Desayuno incluido','Mascotas permitidas','Vista al mar','Jacuzzi','Sauna','Seguridad 24h','Restaurante','Bar'];
const CIUDADES = ['Quito','Guayaquil','Cuenca','Manta','Baños','Salinas','Galápagos','Loja','Ambato','Ibarra'];

const estadoMap = {
  PENDIENTE: { cls: 'badge-yellow', label: 'Pendiente' },
  CONFIRMADA: { cls: 'badge-green', label: 'Confirmada' },
  CANCELADA: { cls: 'badge-red', label: 'Cancelada' },
  COMPLETADA: { cls: 'badge-blue', label: 'Completada' },
};

function PropertyFormModal({ property, onClose, onSaved }) {
  const IMGS_DEMO = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
    "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800",
    "https://images.unsplash.com/photo-1611048267451-e6ed903f4f53?w=800",
  ];

  const [form, setForm] = useState(property || {
    titulo: '', descripcion: '', tipo: 'APARTAMENTO', ciudad: 'Quito', pais: 'Ecuador',
    direccion: '', precio_noche: 80, max_huespedes: 2, habitaciones: 1, camas: 1, banos: 1,
    imagen_principal: IMGS_DEMO[0], imagenes: [IMGS_DEMO[0]], amenidades: ['WiFi'],
  });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleAmenidad = (a) => {
    const cur = form.amenidades || [];
    set('amenidades', cur.includes(a) ? cur.filter(x => x !== a) : [...cur, a]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, precio_noche: +form.precio_noche, max_huespedes: +form.max_huespedes, habitaciones: +form.habitaciones, camas: +form.camas, banos: +form.banos };
      if (property) { await propertiesAPI.update(property.id, payload); toast.success('Propiedad actualizada'); }
      else { await propertiesAPI.create(payload); toast.success('Propiedad publicada'); }
      onSaved();
    } catch (err) { toast.error(err.response?.data?.detail || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <h3>{property ? 'Editar propiedad' : 'Nueva propiedad'}</h3>
          <button className="modal-close" onClick={onClose}><MdClose /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group"><label className="form-label">Título *</label><input className="form-control" value={form.titulo} onChange={e => set('titulo', e.target.value)} placeholder="Ej: Suite Ejecutiva Centro Histórico" required /></div>
            <div className="form-group"><label className="form-label">Descripción</label><textarea className="form-control" rows={3} value={form.descripcion} onChange={e => set('descripcion', e.target.value)} placeholder="Describe tu propiedad..." /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Tipo</label><select className="form-control" value={form.tipo} onChange={e => set('tipo', e.target.value)}>{TIPOS.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Ciudad *</label><select className="form-control" value={form.ciudad} onChange={e => set('ciudad', e.target.value)}>{CIUDADES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            </div>
            <div className="form-group"><label className="form-label">Dirección</label><input className="form-control" value={form.direccion} onChange={e => set('direccion', e.target.value)} /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Precio por noche ($) *</label><input className="form-control" type="number" min="1" step="0.01" value={form.precio_noche} onChange={e => set('precio_noche', e.target.value)} required /></div>
              <div className="form-group"><label className="form-label">Máx. huéspedes</label><input className="form-control" type="number" min="1" max="20" value={form.max_huespedes} onChange={e => set('max_huespedes', e.target.value)} /></div>
            </div>
            <div className="form-row-3">
              <div className="form-group"><label className="form-label">Habitaciones</label><input className="form-control" type="number" min="1" value={form.habitaciones} onChange={e => set('habitaciones', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Camas</label><input className="form-control" type="number" min="1" value={form.camas} onChange={e => set('camas', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Baños</label><input className="form-control" type="number" min="1" value={form.banos} onChange={e => set('banos', e.target.value)} /></div>
            </div>

            <div className="form-group">
              <label className="form-label">Imagen principal (URL)</label>
              <select className="form-control" value={form.imagen_principal} onChange={e => { set('imagen_principal', e.target.value); set('imagenes', [e.target.value]); }}>
                {IMGS_DEMO.map((img, i) => <option key={i} value={img}>Imagen {i+1}</option>)}
              </select>
              {form.imagen_principal && <img src={form.imagen_principal} alt="" style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 8, marginTop: 8 }} />}
            </div>

            <div className="form-group">
              <label className="form-label">Amenidades</label>
              <div className="tag-grid">
                {AMENIDADES_ALL.map(a => (
                  <div key={a} className={`tag ${(form.amenidades || []).includes(a) ? 'selected' : ''}`} onClick={() => toggleAmenidad(a)}>
                    {(form.amenidades || []).includes(a) && <MdCheck style={{ fontSize: 12, marginRight: 2 }} />}{a}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Guardando...' : property ? 'Actualizar' : 'Publicar propiedad'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState('overview');
  const [stats, setStats] = useState(null);
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [propModal, setPropModal] = useState(null);

  const isAdmin = user?.rol === 'ADMIN';

  const loadAll = async () => {
    setLoading(true);
    try {
      const [statsRes] = await Promise.all([bookingsAPI.stats()]);
      setStats(statsRes.data);
      if (section === 'properties' || section === 'overview') {
        const pRes = await (isAdmin ? propertiesAPI.list({}) : propertiesAPI.my());
        setProperties(pRes.data);
      }
      if (section === 'bookings') {
        const bRes = await (isAdmin ? bookingsAPI.hostBookings() : bookingsAPI.hostBookings());
        setBookings(bRes.data);
      }
      if (section === 'users' && isAdmin) {
        const uRes = await usersAPI.list();
        setUsers(uRes.data);
      }
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadAll(); }, [section]);

  const handleDeleteProp = async (id) => {
    if (!window.confirm('¿Desactivar esta propiedad?')) return;
    try { await propertiesAPI.delete(id); toast.success('Propiedad desactivada'); loadAll(); }
    catch { toast.error('Error'); }
  };

  const nav = [
    { key: 'overview', label: 'Resumen', icon: <MdDashboard /> },
    { key: 'properties', label: 'Propiedades', icon: <MdHome /> },
    { key: 'bookings', label: 'Reservas', icon: <MdBookmark /> },
    ...(isAdmin ? [{ key: 'users', label: 'Usuarios', icon: <MdPeople /> }] : []),
  ];

  const chartData = stats ? [
    { name: 'Pendiente', value: stats.confirmadas, fill: '#F59E0B' },
    { name: 'Confirmada', value: stats.confirmadas, fill: '#10B981' },
    { name: 'Completada', value: stats.completadas, fill: '#3B82F6' },
    { name: 'Cancelada', value: stats.canceladas, fill: '#EF4444' },
  ] : [];

  return (
    <>
      <Navbar />
      <div className="dash-layout">
        {/* Sidebar */}
        <div className="dash-sidebar">
          <div style={{ padding: '0 24px 24px', borderBottom: '1px solid #EBEBEB', marginBottom: 8 }}>
            <div style={{ fontSize: 13, color: '#767676', marginBottom: 4 }}>Hola,</div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>{user?.full_name?.split(' ')[0]}</div>
            <div style={{ fontSize: 12, color: '#767676', marginTop: 2 }}>{user?.rol === 'ADMIN' ? '👑 Administrador' : '🏠 Anfitrión'}</div>
          </div>
          {nav.map(n => (
            <div key={n.key} className={`dash-nav-item ${section === n.key ? 'active' : ''}`} onClick={() => setSection(n.key)}>
              {n.icon} {n.label}
            </div>
          ))}
          <div className="dash-nav-item" style={{ marginTop: 'auto' }} onClick={() => navigate('/')}>
            <MdHome /> Ver sitio
          </div>
        </div>

        {/* Content */}
        <div className="dash-content">
          {/* OVERVIEW */}
          {section === 'overview' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                <div>
                  <h2 style={{ fontSize: 24, fontWeight: 800 }}>Panel de control</h2>
                  <p style={{ color: '#767676', fontSize: 14 }}>Vista general de tu actividad</p>
                </div>
              </div>

              <div className="stats-row">
                {[
                  { label: 'Reservas totales', val: stats?.total_reservas ?? 0, icon: '📊', bg: '#dbeafe', color: '#1e40af' },
                  { label: 'Confirmadas', val: stats?.confirmadas ?? 0, icon: '✅', bg: '#d1fae5', color: '#065f46' },
                  { label: 'Propiedades', val: stats?.total_propiedades ?? 0, icon: '🏠', bg: '#fce7f3', color: '#9d174d' },
                  { label: 'Ingresos ($)', val: `$${(stats?.ingresos_totales ?? 0).toLocaleString()}`, icon: '💰', bg: '#fef3c7', color: '#92400e' },
                  ...(isAdmin ? [{ label: 'Usuarios', val: stats?.total_usuarios ?? 0, icon: '👥', bg: '#ede9fe', color: '#5b21b6' }] : []),
                ].map(s => (
                  <div key={s.label} className="stat-box">
                    <div className="stat-box-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                    <h3 style={{ color: s.color }}>{s.val}</h3>
                    <p>{s.label}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
                <div className="panel">
                  <div className="panel-header"><h3>Estado de reservas</h3></div>
                  <div className="panel-body">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={chartData} barSize={32}>
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="value" radius={[6,6,0,0]}>
                          {chartData.map((entry, i) => <rect key={i} fill={entry.fill} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="panel">
                  <div className="panel-header"><h3>Mis propiedades top</h3></div>
                  <div className="panel-body">
                    {properties.slice(0, 4).map(p => (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                        <img src={p.imagen_principal} alt={p.titulo} style={{ width: 48, height: 40, objectFit: 'cover', borderRadius: 8 }} onError={e => e.target.style.display='none'} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.titulo}</div>
                          <div style={{ fontSize: 12, color: '#767676' }}>{p.ciudad} · ${p.precio_noche}/noche</div>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <MdStar style={{ color: '#FF385C', fontSize: 14 }} /> {p.rating_promedio.toFixed(1)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* PROPERTIES */}
          {section === 'properties' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800 }}>Mis propiedades</h2>
                <button className="btn btn-primary" onClick={() => setPropModal('new')}><MdAdd /> Nueva propiedad</button>
              </div>
              {loading ? <div className="spinner" /> : (
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Propiedad</th><th>Ciudad</th><th>Tipo</th><th>Precio/noche</th><th>Rating</th><th>Reservas</th><th>Estado</th><th>Acciones</th></tr></thead>
                    <tbody>
                      {properties.length === 0 ? (
                        <tr><td colSpan={8}><div className="empty-state" style={{ padding: 40 }}><span style={{ fontSize: 40 }}>🏠</span><p>No tienes propiedades publicadas</p></div></td></tr>
                      ) : properties.map(p => (
                        <tr key={p.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <img src={p.imagen_principal} alt="" style={{ width: 44, height: 36, objectFit: 'cover', borderRadius: 6 }} onError={e => e.target.style.display='none'} />
                              <div>
                                <div style={{ fontWeight: 700, fontSize: 13, maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.titulo}</div>
                                <div style={{ fontSize: 11, color: '#767676' }}>{p.habitaciones}hab · {p.camas}cam · {p.banos}bñ · máx {p.max_huespedes}</div>
                              </div>
                            </div>
                          </td>
                          <td>{p.ciudad}</td>
                          <td><span className="badge badge-gray" style={{ fontSize: 10 }}>{p.tipo}</span></td>
                          <td><strong>${p.precio_noche}</strong></td>
                          <td>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontWeight: 700, fontSize: 13 }}>
                              <MdStar style={{ color: '#FF385C' }} /> {p.rating_promedio.toFixed(1)} ({p.total_reviews})
                            </span>
                          </td>
                          <td>{p.total_bookings}</td>
                          <td><span className={`badge ${p.estado === 'ACTIVO' ? 'badge-green' : 'badge-gray'}`}>{p.estado}</span></td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="btn btn-outline btn-sm" onClick={() => setPropModal(p)}><MdEdit /></button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleDeleteProp(p.id)}><MdDelete /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* BOOKINGS */}
          {section === 'bookings' && (
            <>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Reservas de mis propiedades</h2>
              {loading ? <div className="spinner" /> : (
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Propiedad</th><th>Huésped</th><th>Check-in</th><th>Check-out</th><th>Noches</th><th>Total</th><th>Estado</th></tr></thead>
                    <tbody>
                      {bookings.length === 0 ? (
                        <tr><td colSpan={7}><div className="empty-state" style={{ padding: 40 }}><p>No hay reservas aún</p></div></td></tr>
                      ) : bookings.map(b => (
                        <tr key={b.id}>
                          <td style={{ maxWidth: 180, fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.property_titulo}</td>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{b.guest_name}</div>
                            <div style={{ fontSize: 11, color: '#767676' }}>{b.guest_email}</div>
                          </td>
                          <td>{new Date(b.check_in + 'T12:00:00').toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                          <td>{new Date(b.check_out + 'T12:00:00').toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                          <td>{b.noches}</td>
                          <td><strong>${b.total.toFixed(2)}</strong></td>
                          <td><span className={`badge ${estadoMap[b.estado]?.cls || 'badge-gray'}`}>{estadoMap[b.estado]?.label || b.estado}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* USERS (Admin only) */}
          {section === 'users' && isAdmin && (
            <>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Gestión de usuarios</h2>
              {loading ? <div className="spinner" /> : (
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th>Verificado</th><th>Registro</th></tr></thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id}>
                          <td><strong>{u.full_name}</strong></td>
                          <td style={{ color: '#767676' }}>{u.email}</td>
                          <td>
                            <span className={`badge ${u.rol === 'ADMIN' ? 'badge-purple' : u.rol === 'HOST' ? 'badge-blue' : 'badge-gray'}`}>{u.rol}</span>
                          </td>
                          <td><span className={`badge ${u.is_active ? 'badge-green' : 'badge-red'}`}>{u.is_active ? 'Activo' : 'Inactivo'}</span></td>
                          <td><span className={`badge ${u.is_verified ? 'badge-green' : 'badge-yellow'}`}>{u.is_verified ? 'Sí' : 'No'}</span></td>
                          <td style={{ fontSize: 12, color: '#767676' }}>{new Date(u.created_at).toLocaleDateString('es-EC')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {propModal && (
        <PropertyFormModal
          property={propModal === 'new' ? null : propModal}
          onClose={() => setPropModal(null)}
          onSaved={() => { setPropModal(null); loadAll(); }}
        />
      )}
    </>
  );
}
