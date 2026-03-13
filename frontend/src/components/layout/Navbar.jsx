import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { MdMenu, MdSearch, MdFavorite, MdHome, MdDashboard, MdLogout, MdPerson, MdBookmark } from 'react-icons/md';
import toast from 'react-hot-toast';

export default function Navbar({ onSearch }) {
  const { user, logout, isAuth } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      navigate(`/?ciudad=${search}`);
      if (onSearch) onSearch(search);
    }
  };

  const handleLogout = () => { logout(); toast.success('Sesión cerrada'); navigate('/'); setOpen(false); };
  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-logo" onClick={() => navigate('/')}>
          🏠 StayHub
        </div>

        <div className="navbar-search">
          <MdSearch style={{ color: '#767676', fontSize: 18, flexShrink: 0 }} />
          <input
            placeholder="¿A dónde vas?"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleSearch}
          />
          <button className="navbar-search-btn" onClick={handleSearch}><MdSearch /></button>
        </div>

        <div className="navbar-actions">
          {isAuth && (user?.rol === 'HOST' || user?.rol === 'ADMIN') && (
            <button className="btn-host" onClick={() => navigate('/dashboard')}>
              Panel de host
            </button>
          )}

          <div className="navbar-user-menu" ref={menuRef} onClick={() => setOpen(!open)}>
            <MdMenu />
            <div className="navbar-user-avatar">
              {user?.avatar_url ? <img src={user.avatar_url} alt={user.full_name} /> : initials}
            </div>
            {open && (
              <div className="dropdown-menu">
                {!isAuth ? (
                  <>
                    <div className="dropdown-item" onClick={() => { navigate('/login'); setOpen(false); }}><MdPerson /> Iniciar sesión</div>
                    <div className="dropdown-item" onClick={() => { navigate('/register'); setOpen(false); }}><MdPerson /> Registrarse</div>
                  </>
                ) : (
                  <>
                    <div className="dropdown-item" onClick={() => { navigate('/mis-reservas'); setOpen(false); }}><MdBookmark /> Mis reservas</div>
                    <div className="dropdown-item" onClick={() => { navigate('/favoritos'); setOpen(false); }}><MdFavorite /> Favoritos</div>
                    {(user?.rol === 'HOST' || user?.rol === 'ADMIN') && (
                      <div className="dropdown-item" onClick={() => { navigate('/dashboard'); setOpen(false); }}><MdDashboard /> Dashboard</div>
                    )}
                    <div className="dropdown-divider" />
                    <div className="dropdown-item danger" onClick={handleLogout}><MdLogout /> Cerrar sesión</div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
