import { useState } from 'react';
import { MdStar, MdStarBorder } from 'react-icons/md';

export function StarRating({ value, onChange, size = 24 }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1,2,3,4,5].map(s => (
        <span
          key={s}
          style={{ fontSize: size, cursor: onChange ? 'pointer' : 'default', color: (hover || value) >= s ? '#FF385C' : '#D1D5DB' }}
          onClick={() => onChange && onChange(s)}
          onMouseEnter={() => onChange && setHover(s)}
          onMouseLeave={() => onChange && setHover(0)}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export function Stars({ rating, size = 14 }) {
  return (
    <div className="stars" style={{ fontSize: size }}>
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{ color: rating >= s ? '#FF385C' : '#D1D5DB' }}>★</span>
      ))}
    </div>
  );
}
