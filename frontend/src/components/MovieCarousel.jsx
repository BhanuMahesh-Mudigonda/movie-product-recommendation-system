import React, { useRef, useLayoutEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import './MovieCarousel.css';

export default function MovieCarousel({
  title,
  movies = [],
  onMovieClick,
  onMovieSelect
}) {
  const handleMovieSelect = onMovieClick || onMovieSelect;
  const scrollRef = useRef(null);

  useLayoutEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }
  }, [movies]);

  const scroll = (direction) => {
    if (!scrollRef.current) return;

    const container = scrollRef.current;

    const scrollAmount =
      container.clientWidth * 0.85;

    container.scrollBy({
      left:
        direction === 'left'
          ? -scrollAmount
          : scrollAmount,
      behavior: 'smooth'
    });
  };

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <section className="carousel-container">

      {/* SECTION HEADER */}
      {title && (
        <div className="carousel-header">

          <h2 className="carousel-title">
            <span className="title-accent"></span>
            {title}
          </h2>

          <button
            className="view-all-btn"
            onClick={() =>
              scrollRef.current?.scrollIntoView({
                behavior: 'smooth'
              })
            }
          >
            View All ›
          </button>

        </div>
      )}

      {/* MOVIE ROW */}
      <div className="carousel-wrapper">

        <button
          className="carousel-btn left"
          onClick={() => scroll('left')}
          aria-label="Previous movies"
        >
          <ChevronLeft size={20} />
        </button>

        <div
          className="carousel-track hide-scrollbar"
          ref={scrollRef}
        >
          {movies.map((movie, idx) => (
            <MovieCard
              key={
                movie.movieId ||
                movie.imdbID ||
                `${movie.title}-${idx}`
              }
              movie={movie}
              onClick={handleMovieSelect}
              rank={
                title?.toLowerCase().includes('trending')
                  ? idx + 1
                  : null
              }
            />
          ))}
        </div>

        <button
          className="carousel-btn right"
          onClick={() => scroll('right')}
          aria-label="Next movies"
        >
          <ChevronRight size={22} />
        </button>

      </div>

    </section>
  );
}