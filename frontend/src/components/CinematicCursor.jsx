import React, { useEffect, useRef } from 'react';
import './CinematicCursor.css';

export default function CinematicCursor() {
  const cursorRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    let mouseX = -100;
    let mouseY = -100;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;

      const target = e.target;
      if (target.closest('.moviemind-portal-btn, .use-demo-btn, .chip-action-btn, .cinematic-portal-trigger, .metallic-movie-reel, button, input')) {
        cursor.classList.add('cursor-active-glow');
      } else {
        cursor.classList.remove('cursor-active-glow');
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="cinematic-cursor-root">
      <div ref={cursorRef} className="cursor-ambient-dot"></div>
    </div>
  );
}
