import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdStar } from 'react-icons/md';
import { propertiesAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export default function PropertyCard({ property, onFavToggle }) {
  const navigate = useNavigate();
  const { isAuth } = useAuth();
  const [isFav, setIsFav] = useState(property.is_favorite);

  const handleFav = async (e) => {
    e.stopPropagation();
    if (!isAuth) { toast.error('Debes iniciar sesión'); return; }
    try {
      const { data } = await propertiesAPI.toggleFav(property.id);
      setIsFav(data.is_favorite);
      if (onFavToggle) onFavToggle(property.id, data.is_favorite);
    } catch { toast.error('Error'); }
  };

  const typeLabels = { HOTEL: '🏨 Hotel', APARTAMENTO: '🏢 Apto', CASA: '🏡 Casa', VILLA: '🏖️ Villa', CABAÑA: '🌲 Cabaña', HOSTAL: '🛏️ Hostal' };

  return (
    <div className="property-card" onClick={() => navigate(`/propiedad/${property.id}`)}>
      <div className="property-image">
        {property.imagen_principal
          ? <img src={property.imagen_principal} alt={property.titulo} loading="lazy" onError={e => e.target.style.display='none'} />
          : <div className="img-placeholder">🏠</div>
        }
        <div className="property-badge">{typeLabels[property.tipo] || property.tipo}</div>
        <button className={`fav-btn ${isFav ? 'active' : ''}`} onClick={handleFav}>
          {isFav ? '❤️' : '🤍'}
        </button>
      </div>
      <div className="property-info">
        <div className="property-info-top">
          <div className="property-name">{property.titulo}</div>
          {property.rating_promedio > 0 && (
            <div className="property-rating">
              <MdStar /> {property.rating_promedio.toFixed(1)}
            </div>
          )}
        </div>
        <div className="property-location">{property.ciudad}, {property.pais}</div>
        <div className="property-price">
          <strong>${property.precio_noche.toFixed(0)}</strong>
          <span> / noche</span>
        </div>
      </div>
    </div>
  );
}
