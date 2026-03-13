import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PropertyCard from '../../components/common/PropertyCard';
import { propertiesAPI } from '../../services/api';
import { MdSearch, MdFilterList, MdClose, MdTune } from 'react-icons/md';
import { FaHotel, FaHome, FaBuilding, FaUmbrellaBeach, FaTree, FaBed } from 'react-icons/fa';

const TIPOS = [
  { key: '', label: 'Todos', icon: <MdSearch /> },
  { key: 'HOTEL', label: 'Hoteles', icon: <FaHotel /> },
  { key: 'APARTAMENTO', label: 'Apartamentos', icon: <FaBuilding /> },
  { key: 'CASA', label: 'Casas', icon: <FaHome /> },
  { key: 'VILLA', label: 'Villas', icon: <FaUmbrellaBeach /> },
  { key: 'CABAÑA', label: 'Cabañas', icon: <FaTree /> },
  { key: 'HOSTAL', label: 'Hostales', icon: <FaBed /> },
];

const CIUDADES = ['Quito', 'Guayaquil', 'Cuenca', 'Manta', 'Baños', 'Salinas', 'Galápagos'];

function FilterModal({ filters, onApply, onClose }) {
  const [local, setLocal] = useState(filters);
  const set = (k, v) => setLocal(f => ({ ...f, [k]: v }));

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <button className="modal-close" onClick={onClose}><MdClose /></button>
          <h3 style={{ textAlign: 'center', flex: 1 }}>Filtros</h3>
          <button className="btn-ghost" onClick={() => setLocal({})}>Limpiar todo</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Ciudad</label>
            <select className="form-control" value={local.ciudad || ''} onChange={e => set('ciudad', e.target.value)}>
              <option value="">Todas las ciudades</option>
              {CIUDADES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Rango de precio por noche</label>
            <div className="form-row">
              <div>
                <label className="form-label" style={{ fontWeight: 400, color: '#767676' }}>Mínimo</label>
                <input className="form-control" type="number" placeholder="$0" value={local.precio_min || ''} onChange={e => set('precio_min', e.target.value)} />
              </div>
              <div>
                <label className="form-label" style={{ fontWeight: 400, color: '#767676' }}>Máximo</label>
                <input className="form-control" type="number" placeholder="$9999" value={local.precio_max || ''} onChange={e => set('precio_max', e.target.value)} />
              </div>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Huéspedes (mínimo)</label>
            <input className="form-control" type="number" min="1" value={local.max_huespedes || ''} onChange={e => set('max_huespedes', e.target.value)} placeholder="Número de huéspedes" />
          </div>
          <div className="form-group">
            <label className="form-label">Habitaciones (mínimo)</label>
            <input className="form-control" type="number" min="1" value={local.habitaciones || ''} onChange={e => set('habitaciones', e.target.value)} placeholder="Número de habitaciones" />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => { onApply(local); onClose(); }}>Aplicar filtros</button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tipo, setTipo] = useState('');
  const [filters, setFilters] = useState({});
  const [showFilter, setShowFilter] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const ciudadParam = searchParams.get('ciudad') || '';

  const load = async (params = {}) => {
    setLoading(true);
    try {
      const res = await propertiesAPI.list({ ...params, ...(tipo && { tipo }), ...(ciudadParam && { ciudad: ciudadParam }) });
      setProperties(res.data);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { load({ ...filters, ...(ciudadParam && { ciudad: ciudadParam }) }); }, [tipo, ciudadParam, filters]);

  const activeFiltersCount = Object.values(filters).filter(v => v).length;

  return (
    <>
      <Navbar />
      {/* Hero */}
      {!ciudadParam && Object.keys(filters).length === 0 && !tipo && (
        <div className="hero">
          <div className="hero-bg" />
          <div className="hero-content">
            <h1>Encuentra tu próximo alojamiento perfecto</h1>
            <p>Más de 100 propiedades únicas en Ecuador y el mundo</p>
            <div className="search-widget">
              <div className="search-field">
                <label>Destino</label>
                <select defaultValue="" onChange={e => navigate(`/?ciudad=${e.target.value}`)}>
                  <option value="">¿A dónde vas?</option>
                  {CIUDADES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="search-field">
                <label>Tipo</label>
                <select defaultValue="" onChange={e => setTipo(e.target.value)}>
                  <option value="">Cualquier tipo</option>
                  {TIPOS.slice(1).map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                </select>
              </div>
              <button className="search-widget-btn" onClick={() => load({ ...filters })}>
                <MdSearch /> Buscar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="categories">
        <div className="categories-inner">
          {TIPOS.map(t => (
            <button key={t.key} className={`cat-pill ${tipo === t.key ? 'active' : ''}`} onClick={() => setTipo(t.key)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="container">
        {/* Filters bar */}
        <div className="filters-bar">
          {ciudadParam && (
            <div className="filter-pill active">
              📍 {ciudadParam}
              <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', alignItems: 'center', marginLeft: 4 }}><MdClose /></button>
            </div>
          )}
          <button className={`filter-pill ${activeFiltersCount > 0 ? 'active' : ''}`} onClick={() => setShowFilter(true)}>
            <MdTune /> Filtros {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </button>
          {activeFiltersCount > 0 && (
            <button className="filter-pill" onClick={() => setFilters({})}>Limpiar filtros</button>
          )}
          <span style={{ marginLeft: 'auto', fontSize: 13, color: '#767676' }}>
            {properties.length} alojamientos encontrados
          </span>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="property-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i}>
                <div className="skeleton" style={{ height: 280, borderRadius: 12 }} />
                <div className="skeleton" style={{ height: 16, borderRadius: 6, margin: '12px 0 6px', width: '70%' }} />
                <div className="skeleton" style={{ height: 12, borderRadius: 6, width: '50%' }} />
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="empty-state">
            <span style={{ fontSize: 56 }}>🔍</span>
            <h3>No encontramos alojamientos</h3>
            <p>Intenta con otros filtros o una ciudad diferente</p>
          </div>
        ) : (
          <div className="property-grid">
            {properties.map(p => <PropertyCard key={p.id} property={p} />)}
          </div>
        )}
      </div>

      {showFilter && <FilterModal filters={filters} onApply={setFilters} onClose={() => setShowFilter(false)} />}
      <Footer />
    </>
  );
}
