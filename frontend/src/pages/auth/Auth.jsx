import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { MdVisibility, MdVisibilityOff, MdEmail, MdLock, MdPerson } from 'react-icons/md';
import { FaHome, FaUserTie } from 'react-icons/fa';

export function Login() {
  const [form, setForm] = useState({ email: 'ana@guest.com', password: 'guest123' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      toast.success('¡Bienvenido de vuelta!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al iniciar sesión');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-layout">
      <div className="auth-image">
        <div className="auth-image-overlay">
          <h2>Descubre alojamientos únicos</h2>
          <p>Desde suites de lujo hasta acogedoras cabañas, encuentra el lugar perfecto para tu próxima aventura.</p>
        </div>
      </div>
      <div className="auth-form-side">
        <div className="auth-logo">🏠 StayHub</div>
        <h2 className="auth-title">Bienvenido de vuelta</h2>
        <p className="auth-sub">Inicia sesión para gestionar tus reservas</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div style={{ position: 'relative' }}>
              <MdEmail style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#B0B0B0', fontSize: 18 }} />
              <input className="form-control" style={{ paddingLeft: 38 }} type="email" placeholder="tu@email.com" value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <MdLock style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#B0B0B0', fontSize: 18 }} />
              <input className="form-control" style={{ paddingLeft: 38, paddingRight: 40 }} type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} required />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#B0B0B0', display: 'flex' }}>
                {showPass ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="auth-divider"><span>O prueba con</span></div>
        <div style={{ display: 'grid', gap: 8 }}>
          {[
            { email: 'admin@stayhub.com', pass: 'admin123', label: '👑 Admin', sub: 'Panel completo' },
            { email: 'maria@host.com', pass: 'host123', label: '🏠 Anfitriona', sub: 'Gestión de propiedades' },
            { email: 'ana@guest.com', pass: 'guest123', label: '🧳 Huésped', sub: 'Buscar y reservar' },
          ].map(u => (
            <button key={u.email} type="button" onClick={() => { setForm({ email: u.email, password: u.pass }); }}
              style={{ border: '1.5px solid #EBEBEB', borderRadius: 10, padding: '10px 14px', background: 'white', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              onMouseOver={e => e.currentTarget.style.borderColor = '#222'} onMouseOut={e => e.currentTarget.style.borderColor = '#EBEBEB'}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{u.label}</div>
                <div style={{ fontSize: 11, color: '#767676' }}>{u.email}</div>
              </div>
              <span style={{ fontSize: 12, color: '#767676' }}>{u.sub}</span>
            </button>
          ))}
        </div>

        <p className="auth-footer">¿No tienes cuenta? <span onClick={() => navigate('/register')} style={{ color: '#FF385C', fontWeight: 700, cursor: 'pointer' }}>Regístrate</span></p>
      </div>
    </div>
  );
}

export function Register() {
  const [form, setForm] = useState({ email: '', full_name: '', password: '', phone: '', rol: 'GUEST' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('¡Cuenta creada! Bienvenido a StayHub');
      navigate('/');
    } catch (err) { toast.error(err.response?.data?.detail || 'Error al registrarse'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-layout">
      <div className="auth-image" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1600')" }}>
        <div className="auth-image-overlay">
          <h2>Conviértete en anfitrión</h2>
          <p>Comparte tu espacio y genera ingresos extras con miles de viajeros que buscan alojamiento único.</p>
        </div>
      </div>
      <div className="auth-form-side">
        <div className="auth-logo">🏠 StayHub</div>
        <h2 className="auth-title">Crear cuenta</h2>
        <p className="auth-sub">Únete a nuestra comunidad de viajeros y anfitriones</p>

        <div style={{ marginBottom: 24 }}>
          <label className="form-label">¿Qué tipo de cuenta quieres?</label>
          <div className="role-select">
            <div className={`role-option ${form.rol === 'GUEST' ? 'active' : ''}`} onClick={() => set('rol', 'GUEST')}>
              <span style={{ fontSize: 28, display: 'block', marginBottom: 6 }}>🧳</span>
              <span style={{ fontWeight: 700, fontSize: 13 }}>Viajero</span>
              <div style={{ fontSize: 11, color: '#767676', marginTop: 2 }}>Busca y reserva</div>
            </div>
            <div className={`role-option ${form.rol === 'HOST' ? 'active' : ''}`} onClick={() => set('rol', 'HOST')}>
              <span style={{ fontSize: 28, display: 'block', marginBottom: 6 }}>🏠</span>
              <span style={{ fontWeight: 700, fontSize: 13 }}>Anfitrión</span>
              <div style={{ fontSize: 11, color: '#767676', marginTop: 2 }}>Publica tu espacio</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre completo</label>
            <div style={{ position: 'relative' }}>
              <MdPerson style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#B0B0B0', fontSize: 18 }} />
              <input className="form-control" style={{ paddingLeft: 38 }} placeholder="Tu nombre" value={form.full_name} onChange={e => set('full_name', e.target.value)} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div style={{ position: 'relative' }}>
              <MdEmail style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#B0B0B0', fontSize: 18 }} />
              <input className="form-control" style={{ paddingLeft: 38 }} type="email" placeholder="tu@email.com" value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <MdLock style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#B0B0B0', fontSize: 18 }} />
              <input className="form-control" style={{ paddingLeft: 38, paddingRight: 40 }} type={showPass ? 'text' : 'password'} placeholder="Mínimo 6 caracteres" value={form.password} onChange={e => set('password', e.target.value)} required minLength={6} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#B0B0B0', display: 'flex' }}>
                {showPass ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Teléfono <span style={{ fontWeight: 400, color: '#767676' }}>(opcional)</span></label>
            <input className="form-control" placeholder="+593 99 999 9999" value={form.phone} onChange={e => set('phone', e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>
        <p className="auth-footer">¿Ya tienes cuenta? <span onClick={() => navigate('/login')} style={{ color: '#FF385C', fontWeight: 700, cursor: 'pointer' }}>Inicia sesión</span></p>
      </div>
    </div>
  );
}
