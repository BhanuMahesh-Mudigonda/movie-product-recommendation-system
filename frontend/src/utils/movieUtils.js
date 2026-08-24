/**
 * Normalizes any incoming movie object from the API into a strict, unified structure.
 * Handles fallbacks and formatting to ensure the UI has a reliable data contract.
 */
export function normalizeMovie(movie) {
  if (!movie) return null;

  const rawGenre = movie.genre || movie.genres || movie.Genre || '';
  const genres = rawGenre
    ? String(rawGenre).replace(/\|/g, ',').split(',').map(g => g.trim()).filter(Boolean)
    : [];

  // Ensure a unique ID, prefer local movieId, fallback to imdbID or stringified title
  const id = movie.movieId || movie.id || movie.imdbID || (movie.title ? `title_${movie.title.replace(/\s+/g, '_')}` : `unknown_${Math.random()}`);

  return {
    ...movie,
    movieId: id,
    imdbID: movie.imdbID || '',
    tmdbId: movie.tmdb_id || movie.tmdbId || '',
    title: movie.title || movie.Title || movie.name || movie.original_title || 'Unknown Movie',
    poster: movie.poster || movie.Poster || movie.poster_url || movie.posterUrl || movie.image || null,
    backdrop: movie.backdrop || movie.Backdrop || movie.backdrop_url || movie.backdropUrl || movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : (movie.poster || movie.Poster || null),
    year: movie.year || movie.Year || movie.release_year || (movie.releaseDate?.slice(0,4)) || (movie.release_date?.slice(0,4)) || '',
    rating: movie.rating || movie.imdbRating || movie.vote_average || movie.avg_rating || null,
    genres: genres,
    language: movie.language || movie.language_code || movie.original_language || '',
    cast: movie.cast || movie.Actors || movie.actors || [],
    director: movie.director || movie.Director || '',
    overview: movie.overview || movie.Plot || movie.plot || movie.description || '',
    trailer: movie.trailer || movie.trailerUrl || movie.trailer_url || movie.youtubeTrailer || '',
    whereToWatch: movie.whereToWatch || [],
    score: movie.recommendationScore || movie.score || 0,
    recommendationScore: movie.recommendationScore || movie.score || 0,
    reason: movie.recommendationReason || movie.reason || ''
  };
}
