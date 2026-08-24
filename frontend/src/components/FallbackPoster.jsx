import React from 'react';
import { Film } from 'lucide-react';
import './FallbackPoster.css';

// Generate consistent gradient colors based on a string
const generateColors = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h1 = Math.abs(hash) % 360;
  const h2 = (h1 + 40) % 360;
  return {
    color1: `hsl(${h1}, 70%, 20%)`,
    color2: `hsl(${h2}, 80%, 15%)`,
    color3: `hsl(${(h1 + 180) % 360}, 60%, 10%)`
  };
};

export default function FallbackPoster({ title, genres }) {
  if (!title) title = "Unknown Movie";
  const { color1, color2, color3 } = generateColors(title);
  
  const displayGenre = genres ? genres.split('|')[0] : 'Cinema';

  return (
    <div 
      className="fallback-poster"
      style={{
        background: `linear-gradient(135deg, ${color1}, ${color2}, ${color3})`
      }}
    >
      <div className="fallback-content">
        <Film className="fallback-icon" size={48} strokeWidth={1} />
        <h3 className="fallback-title">{title}</h3>
        <span className="fallback-genre">{displayGenre}</span>
      </div>
      <div className="fallback-glow" style={{ background: color1 }}></div>
    </div>
  );
}
