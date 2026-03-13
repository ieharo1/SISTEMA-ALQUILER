import { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PropertyCard from '../../components/common/PropertyCard';
import { propertiesAPI } from '../../services/api';

export default function Favorites() {
  const [favs, setFavs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    propertiesAPI.favorites().then(r => setFavs(r.data)).finally(() => setLoading(false));
  }, []);

  const handleFavToggle = (id, isFav) => {
    if (!isFav) setFavs(f => f.filter(p => p.id !== id));
  };

  return (
    <>
      <Navbar />
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Mis favoritos</h1>
        <p style={{ color: '#767676', marginBottom: 28 }}>Propiedades que has guardado</p>
        {loading ? <div className="spinner" /> : favs.length === 0 ? (
          <div className="empty-state">
            <span style={{ fontSize: 56, display: 'block', marginBottom: 16 }}>❤️</span>
            <h3>Aún no tienes favoritos</h3>
            <p>Guarda los alojamientos que te gusten haciendo clic en el corazón</p>
          </div>
        ) : (
          <div className="property-grid">
            {favs.map(p => <PropertyCard key={p.id} property={p} onFavToggle={handleFavToggle} />)}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
