const axios = require('axios');
const { request, response } = require('express');
const { run, get, all } = require('../config/database');

const BASE_URL = process.env.TMDB_BASE_URL;
const ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;
const DEFAULT_LANGUAGE = 'es-ES';
const MOVIES_LIMIT = 70;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${ACCESS_TOKEN}`,
    accept: 'application/json'
  }
});

// ============================================
// FUNCIONES AUXILIARES
// ============================================

const handleError = (res, error, customMessage) => {
  console.error(error);
  const status = error.response?.status || 500;
  const message = status === 404 ? 'No encontrado' : customMessage || 'Error inesperado';
  res.status(status).json({ msg: 'Error', error: message });
};

const mapMovieResults = (results) => results.map(({
  id,
  title,
  release_date,
  overview,
  vote_average,
  poster_path,
  genre_ids,
}) => ({
  key: `/movies/${id}`,
  title,
  releaseDate: release_date,
  overview,
  voteAverage: vote_average,
  posterPath: poster_path ? `https://image.tmdb.org/t/p/w500${poster_path}` : null,
  genres: genre_ids || []
}));

// ============================================
// CRUD - CREATE (Guardar película en BD)
// ============================================

const createMovie = async (req = request, res = response) => {
  try {
    const { tmdb_id, title, overview, release_date, vote_average, poster_path, genre_ids } = req.body;

    // Validaciones
    if (!tmdb_id || !title) {
      return res.status(400).json({
        msg: 'Error',
        error: 'tmdb_id y title son requeridos'
      });
    }

    // Verificar si ya existe
    const existing = await get('SELECT id FROM movies WHERE tmdb_id = ?', [tmdb_id]);
    if (existing) {
      return res.status(409).json({
        msg: 'Error',
        error: 'La película ya existe en la base de datos',
        data: { id: existing.id }
      });
    }

    // Insertar
    const result = await run(
      `INSERT INTO movies (tmdb_id, title, overview, release_date, vote_average, poster_path, genre_ids)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [tmdb_id, title, overview, release_date, vote_average, poster_path, JSON.stringify(genre_ids)]
    );

    res.status(201).json({
      msg: 'Película creada exitosamente',
      data: {
        id: result.id,
        tmdb_id,
        title
      }
    });
  } catch (error) {
    handleError(res, error, 'Error al crear la película');
  }
};

// ============================================
// CRUD - READ (Listar películas de BD)
// ============================================

const getMoviesFromDB = async (req = request, res = response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const movies = await all(
      'SELECT * FROM movies ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [parseInt(limit), parseInt(offset)]
    );

    const total = await get('SELECT COUNT(*) as count FROM movies');

    res.status(200).json({
      msg: 'Ok',
      data: movies.map(movie => ({
        ...movie,
        genre_ids: JSON.parse(movie.genre_ids || '[]')
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total.count
      }
    });
  } catch (error) {
    handleError(res, error, 'Error al obtener películas de la base de datos');
  }
};

// ============================================
// CRUD - READ ONE (Obtener película por ID de BD)
// ============================================

const getMovieFromDBById = async (req = request, res = response) => {
  try {
    const { id } = req.params;

    const movie = await get('SELECT * FROM movies WHERE id = ?', [id]);

    if (!movie) {
      return res.status(404).json({
        msg: 'Error',
        error: 'Película no encontrada'
      });
    }

    res.status(200).json({
      msg: 'Ok',
      data: {
        ...movie,
        genre_ids: JSON.parse(movie.genre_ids || '[]')
      }
    });
  } catch (error) {
    handleError(res, error, 'Error al obtener la película');
  }
};

// ============================================
// CRUD - UPDATE
// ============================================

const updateMovie = async (req = request, res = response) => {
  try {
    const { id } = req.params;
    const { title, overview, release_date, vote_average, poster_path, genre_ids } = req.body;

    // Verificar que existe
    const existing = await get('SELECT id FROM movies WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        msg: 'Error',
        error: 'Película no encontrada'
      });
    }

    // Actualizar
    await run(
      `UPDATE movies 
       SET title = COALESCE(?, title),
           overview = COALESCE(?, overview),
           release_date = COALESCE(?, release_date),
           vote_average = COALESCE(?, vote_average),
           poster_path = COALESCE(?, poster_path),
           genre_ids = COALESCE(?, genre_ids)
       WHERE id = ?`,
      [title, overview, release_date, vote_average, poster_path, 
       genre_ids ? JSON.stringify(genre_ids) : null, id]
    );

    res.status(200).json({
      msg: 'Película actualizada exitosamente',
      data: { id }
    });
  } catch (error) {
    handleError(res, error, 'Error al actualizar la película');
  }
};

// ============================================
// CRUD - DELETE
// ============================================

const deleteMovie = async (req = request, res = response) => {
  try {
    const { id } = req.params;

    // Verificar que existe
    const existing = await get('SELECT id FROM movies WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        msg: 'Error',
        error: 'Película no encontrada'
      });
    }

    // Eliminar
    await run('DELETE FROM movies WHERE id = ?', [id]);

    res.status(200).json({
      msg: 'Película eliminada exitosamente',
      data: { id }
    });
  } catch (error) {
    handleError(res, error, 'Error al eliminar la película');
  }
};

// ============================================
// FUNCIONES EXISTENTES (TMDb API)
// ============================================

const getFromAPI = async (endpoint, params = {}) => {
  let allResults = [];
  let page = 1;

  while (allResults.length < MOVIES_LIMIT) {
    const response = await axiosInstance.get(endpoint, {
      params: { ...params, language: DEFAULT_LANGUAGE, page }
    });
    allResults = allResults.concat(response.data.results);
    if (response.data.total_pages === page || allResults.length >= MOVIES_LIMIT) break;
    page++;
  }

  return {
    results: allResults.slice(0, MOVIES_LIMIT),
    total_results: Math.min(allResults.length, MOVIES_LIMIT)
  };
};

const getPopularMovies = async (req = request, res = response) => {
  try {
    const data = await getFromAPI('/movie/popular');
    res.status(200).json({
      msg: 'Ok',
      data: mapMovieResults(data.results),
      total_results: data.total_results
    });
  } catch (error) {
    handleError(res, error, 'Error al obtener la lista de películas populares');
  }
};

const getMovieById = async (req = request, res = response) => {
  try {
    const { id } = req.params;
    const data = await axiosInstance.get(`/movie/${id}`, {
      params: { language: DEFAULT_LANGUAGE }
    });

    if (!data || !data.data) {
      return res.status(404).json({
        msg: 'Error',
        error: 'Película no encontrada'
      });
    }

    const { title, release_date, overview, vote_average, genres, poster_path } = data.data;

    res.status(200).json({
      msg: 'Ok',
      data: {
        key: `/movies/${id}`,
        title,
        releaseDate: release_date,
        overview,
        voteAverage: vote_average,
        genres: genres ? genres.map(genre => genre.name) : [],
        posterPath: poster_path ? `https://image.tmdb.org/t/p/w500${poster_path}` : null
      }
    });
  } catch (error) {
    handleError(res, error, 'Error al obtener la información de la película');
  }
};

const searchMovies = async (req = request, res = response) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ msg: 'Error', error: 'Debes proporcionar un término de búsqueda' });
    }
    const data = await getFromAPI('/search/movie', { query, page: 1 });
    res.status(200).json({ msg: 'Ok', data: mapMovieResults(data.results) });
  } catch (error) {
    handleError(res, error, 'Error al buscar películas');
  }
};

const getMoviesByGenre = async (req = request, res = response) => {
  try {
    const { genre = '' } = req.query;
    if (!genre) {
      return res.status(400).json({ msg: 'Error', error: 'Debes proporcionar un género para filtrar las películas' });
    }

    const normalizeText = (text) => {
      return text.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    };

    const genresResponse = await axiosInstance.get('/genre/movie/list', {
      params: { language: DEFAULT_LANGUAGE }
    });

    if (!genresResponse.data || !genresResponse.data.genres) {
      return res.status(500).json({ msg: 'Error', error: 'No se pudo obtener la lista de géneros' });
    }

    const normalizedSearchGenre = normalizeText(genre);

    const genreFound = genresResponse.data.genres.find(g =>
      normalizeText(g.name) === normalizedSearchGenre
    );

    if (!genreFound) {
      return res.status(404).json({ msg: 'Error', error: 'Género no encontrado' });
    }

    const moviesData = await getFromAPI('/discover/movie', { with_genres: genreFound.id, page: 1 });
    res.status(200).json({ msg: 'Ok', data: mapMovieResults(moviesData.results) });
  } catch (error) {
    handleError(res, error, 'Error al obtener las películas por género');
  }
};

const getGenresList = async (req = request, res = response) => {
  try {
    const response = await axiosInstance.get('/genre/movie/list', {
      params: { language: DEFAULT_LANGUAGE }
    });
    
    const genres = response.data.genres.map(genre => genre.name);

    res.status(200).json({
      msg: 'Ok',
      data: genres
    });
  } catch (error) {
    handleError(res, error, 'Error al obtener la lista de géneros');
  }
};

module.exports = {  
  createMovie,
  getMoviesFromDB,
  getMovieFromDBById,
  updateMovie,
  deleteMovie, 
  getPopularMovies,
  getMovieById,
  searchMovies,
  getGenresList,
  getMoviesByGenre
};