const axios = require('axios');
const { request, response } = require('express');

// Configuración de TMDB (igual que en movies.js)
const TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;

const tmdbAxios = axios.create({
  baseURL: TMDB_BASE_URL,
  headers: {
    Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
    accept: 'application/json'
  }
});

// Obtener una lista general de series populares
const getSeries = async (req = request, res = response) => {
  try {
    const { page = 1 } = req.query;

    // Llamada al endpoint de TMDB para obtener series populares
    const response = await tmdbAxios.get('/tv/popular', {
      params: {
        page: page,
        language: 'es-ES'
      }
    });

    const series = response.data.results.map((show) => ({
      id: show.id,
      name: show.name,
      genres: show.genre_ids, // TMDB devuelve IDs de géneros, no nombres
      first_air_date: show.first_air_date,
      overview: show.overview,
      poster_path: show.poster_path,
      vote_average: show.vote_average,
      imageUrl: show.poster_path
        ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
        : 'https://via.placeholder.com/210x295'
    }));

    res.status(200).json({
      status: 'ok',
      data: series,
      total_pages: response.data.total_pages,
      total_results: response.data.total_results,
      page: parseInt(page)
    });
  } catch (error) {
    console.error('Error al obtener las series:', error);
    res.status(500).json({
      status: 'error',
      msg: 'Error inesperado al obtener la lista de series. Por favor, inténtalo de nuevo más tarde.'
    });
  }
};

// Obtener una serie por su ID
const getSeriePorId = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const response = await tmdbAxios.get(`/tv/${id}`, {
      params: { language: 'es-ES' }
    });

    const show = response.data;

    res.status(200).json({
      status: 'ok',
      data: {
        id: show.id,
        name: show.name,
        genres: show.genres.map(g => g.name), // TMDB devuelve objetos de género
        first_air_date: show.first_air_date,
        overview: show.overview,
        status: show.status,
        vote_average: show.vote_average,
        poster_path: show.poster_path,
        imageUrl: show.poster_path
          ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
          : 'https://via.placeholder.com/210x295'
      }
    });
  } catch (error) {
    console.error('Error al obtener la serie:', error);
    res.status(404).json({
      status: 'error',
      msg: 'Serie no encontrada'
    });
  }
};

// Filtrar series por género
const getSeriesPorGenero = async (req = request, res = response) => {
  const { genre = '', page = 1 } = req.query;

  if (!genre) {
    return res.status(400).json({
      status: 'error',
      msg: 'Debes proporcionar un género para filtrar las series'
    });
  }

  try {
    // Primero obtener la lista de géneros para mapear el nombre al ID
    const genresResponse = await tmdbAxios.get('/genre/tv/list', {
      params: { language: 'es-ES' }
    });

    const genreObj = genresResponse.data.genres.find(g =>
      g.name.toLowerCase() === genre.toLowerCase()
    );

    if (!genreObj) {
      return res.status(400).json({
        status: 'error',
        msg: `Género "${genre}" no encontrado`
      });
    }

    // Buscar series con ese género
    const response = await tmdbAxios.get('/discover/tv', {
      params: {
        with_genres: genreObj.id,
        page: page,
        language: 'es-ES',
        sort_by: 'popularity.desc'
      }
    });

    const series = response.data.results.map((show) => ({
      id: show.id,
      name: show.name,
      genres: show.genre_ids,
      first_air_date: show.first_air_date,
      overview: show.overview,
      poster_path: show.poster_path,
      vote_average: show.vote_average,
      imageUrl: show.poster_path
        ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
        : 'https://via.placeholder.com/210x295'
    }));

    if (series.length === 0) {
      return res.status(404).json({
        status: 'error',
        msg: `No se encontraron series para el género "${genre}"`
      });
    }

    res.status(200).json({
      status: 'ok',
      data: series,
      total_pages: response.data.total_pages,
      total_results: response.data.total_results,
      page: parseInt(page)
    });
  } catch (error) {
    console.error('Error al obtener las series por género:', error);
    res.status(500).json({
      status: 'error',
      msg: 'Error inesperado al obtener las series por género'
    });
  }
};

// Buscar series por nombre
const searchSeries = async (req = request, res = response) => {
  const { query = '', page = 1 } = req.query;

  if (!query) {
    return res.status(400).json({
      status: 'error',
      msg: 'Debes proporcionar un término de búsqueda'
    });
  }

  try {
    const response = await tmdbAxios.get('/search/tv', {
      params: {
        query: query,
        page: page,
        language: 'es-ES'
      }
    });

    const series = response.data.results.map((show) => ({
      id: show.id,
      name: show.name,
      genres: show.genre_ids,
      first_air_date: show.first_air_date,
      overview: show.overview,
      poster_path: show.poster_path,
      vote_average: show.vote_average,
      imageUrl: show.poster_path
        ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
        : 'https://via.placeholder.com/210x295'
    }));

    if (series.length === 0) {
      return res.status(404).json({
        status: 'error',
        msg: `No se encontraron series para la búsqueda "${query}"`
      });
    }

    res.status(200).json({
      status: 'ok',
      data: series,
      total_pages: response.data.total_pages,
      total_results: response.data.total_results,
      page: parseInt(page)
    });
  } catch (error) {
    console.error('Error al buscar series:', error);
    res.status(500).json({
      status: 'error',
      msg: 'Error inesperado al buscar series'
    });
  }
};

module.exports = {
  getSeries,
  getSeriePorId,
  getSeriesPorGenero,
  searchSeries
};
