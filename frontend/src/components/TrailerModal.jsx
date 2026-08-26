import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Film } from 'lucide-react';
import { resolveTrailerUrl } from '../utils/movieUtils';
import './TrailerModal.css';

export default function TrailerModal({ isOpen, trailerUrl, movieTitle, movie, onClose }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const rawUrl = trailerUrl || movie?.trailer || movie;
  const resolvedUrl = typeof rawUrl === 'string'
    ? (rawUrl.startsWith('http') || rawUrl.includes('youtube.com') ? rawUrl : resolveTrailerUrl(rawUrl) || resolveTrailerUrl(movie))
    : resolveTrailerUrl(movie || rawUrl);

  const extractYouTubeId = (url) => {
    if (!url || typeof url !== 'string') return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = typeof url === 'string' ? url.match(regExp) : null;
    return (match && match[2] && match[2].length === 11) ? match[2] : null;
  };

  const getEmbedUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    if (url.includes('youtube.com/results?search_query=')) return null;
    const videoId = extractYouTubeId(url);
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&rel=0`;
    }
    if (url.includes('youtube.com/embed/')) return url;
    return null;
  };

  const embedUrl = getEmbedUrl(resolvedUrl);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="trailer-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="trailer-modal-content"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="trailer-modal-actions">
              {resolvedUrl && (
                <button
                  className="trailer-youtube-btn"
                  onClick={() => window.open(resolvedUrl, '_blank', 'noopener,noreferrer')}
                  aria-label="Open on YouTube"
                >
                  ↗ Open on YouTube
                </button>
              )}
              <button className="trailer-close-btn" onClick={onClose} aria-label="Close trailer">
                <X size={24} />
              </button>
            </div>
            <div className="trailer-video-container">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  title={`${movieTitle || movie?.title || 'Movie'} Trailer`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  padding: '40px 20px',
                  textAlign: 'center',
                  background: '#0a0d14',
                  color: '#ffffff'
                }}>
                  <Film size={48} style={{ color: '#00f2ff', marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>
                    {movieTitle || movie?.title || 'Movie'} Official Trailer
                  </h3>
                  <p style={{ color: '#94a3b8', marginBottom: '24px', fontSize: '0.95rem' }}>
                    Watch the official trailer on YouTube
                  </p>
                  <button
                    className="trailer-youtube-btn"
                    style={{ background: '#ff0000', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                    onClick={() => window.open(resolvedUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent(`${movieTitle || movie?.title || ''} official trailer`)}`, '_blank', 'noopener,noreferrer')}
                  >
                    Watch Trailer on YouTube ↗
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
