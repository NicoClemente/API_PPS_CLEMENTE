const pool = require('../config/database');
const axios = require('axios');

// Configuración de TMDB
const TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;

const tmdbAxios = axios.create({
  baseURL: TMDB_BASE_URL,
  headers: {
    Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
    accept: 'application/json'
  }
});

/**
 * Validar si un ID de TMDB existe
 */
const validateTmdbId = async (type, tmdbId) => {
  try {
    const endpoint = type === 'movie' ? `/movie/${tmdbId}` : `/tv/${tmdbId}`;
    const response = await tmdbAxios.get(endpoint, {
      params: { language: 'es-ES' }
    });
    return response.data;
  } catch (error) {
    console.log(`❌ TMDB ID ${tmdbId} para ${type} no válido:`, error.response?.status);
    return null;
  }
};

/**
 * Crear o actualizar una review
 */
exports.createOrUpdateReview = async (req, res) => {
  try {
    const { item_type, item_id, tmdb_id, rating, review_text, is_favorite } = req.body;
    const user_id = req.user.id;

    // Validaciones
    if (!item_type || !item_id) {
      return res.status(400).json({
        success: false,
        msg: 'item_type e item_id son requeridos'
      });
    }

    const validTypes = ['movie', 'series'];
    if (!validTypes.includes(item_type)) {
      return res.status(400).json({
        success: false,
        msg: 'item_type debe ser: movie o series'
      });
    }

    if (rating && (rating < 1 || rating > 10)) {
      return res.status(400).json({
        success: false,
        msg: 'rating debe estar entre 1 y 10'
      });
    }

    // Validar TMDB ID si se proporciona
    let validTmdbId = tmdb_id;
    if (tmdb_id) {
      console.log(`🔍 Validando TMDB ID ${tmdb_id} para ${item_type}...`);
      const tmdbData = await validateTmdbId(item_type, tmdb_id);
      if (!tmdbData) {
        return res.status(400).json({
          success: false,
          msg: `El TMDB ID ${tmdb_id} no es válido para ${item_type}`
        });
      }
      console.log(`✅ TMDB ID válido: ${tmdbData.title || tmdbData.name}`);
    } else {
      // Si no se proporciona tmdb_id, usar item_id como fallback
      validTmdbId = item_id;
    }

    // Insertar o actualizar
    const query = `
      INSERT INTO reviews (user_id, item_type, item_id, tmdb_id, rating, review_text, is_favorite)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (user_id, item_type, item_id) 
      DO UPDATE SET
        rating = COALESCE($5, reviews.rating),
        review_text = COALESCE($6, reviews.review_text),
        is_favorite = COALESCE($7, reviews.is_favorite),
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const result = await pool.query(query, [
      user_id,
      item_type,
      item_id,
      validTmdbId,
      rating,
      review_text,
      is_favorite
    ]);

    res.status(201).json({
      success: true,
      msg: 'Review guardada exitosamente',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error en createOrUpdateReview:', error);
    res.status(500).json({
      success: false,
      msg: 'Error al guardar review',
      error: error.message
    });
  }
};

/**
 * Obtener reviews del usuario
 */
exports.getUserReviews = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { type } = req.query;

    let query = 'SELECT * FROM reviews WHERE user_id = $1';
    const params = [user_id];

    if (type) {
      query += ' AND item_type = $2';
      params.push(type);
    }

    query += ' ORDER BY updated_at DESC';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('❌ Error en getUserReviews:', error);
    res.status(500).json({
      success: false,
      msg: 'Error al obtener reviews',
      error: error.message
    });
  }
};

/**
 * Obtener una review específica
 */
exports.getReview = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { item_type, item_id } = req.query;

    if (!item_type || !item_id) {
      return res.status(400).json({
        success: false,
        msg: 'item_type e item_id son requeridos'
      });
    }

    const query = `
      SELECT * FROM reviews 
      WHERE user_id = $1 AND item_type = $2 AND item_id = $3
    `;

    const result = await pool.query(query, [user_id, item_type, item_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        msg: 'Review no encontrada'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error en getReview:', error);
    res.status(500).json({
      success: false,
      msg: 'Error al obtener review',
      error: error.message
    });
  }
};

/**
 * Eliminar una review
 */
exports.deleteReview = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { item_type, item_id, id } = req.body;

    let query, params;

    if (id) {
      query = 'DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING *';
      params = [id, user_id];
    } else if (item_type && item_id) {
      query = 'DELETE FROM reviews WHERE user_id = $1 AND item_type = $2 AND item_id = $3 RETURNING *';
      params = [user_id, item_type, item_id];
    } else {
      return res.status(400).json({
        success: false,
        msg: 'Proporciona id o (item_type + item_id)'
      });
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        msg: 'Review no encontrada'
      });
    }

    res.json({
      success: true,
      msg: 'Review eliminada exitosamente'
    });

  } catch (error) {
    console.error('❌ Error en deleteReview:', error);
    res.status(500).json({
      success: false,
      msg: 'Error al eliminar review',
      error: error.message
    });
  }
};

/**
 * Obtener todas las reviews de un item (público)
 */
exports.getItemReviews = async (req, res) => {
  try {
    const { item_type, item_id } = req.query;

    if (!item_type || !item_id) {
      return res.status(400).json({
        success: false,
        msg: 'item_type e item_id son requeridos'
      });
    }

    const query = `
      SELECT 
        r.id,
        r.item_type,
        r.item_id,
        r.rating,
        r.review_text,
        r.is_favorite,
        r.created_at,
        r.updated_at,
        u.nombre,
        u.apellido
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.item_type = $1 AND r.item_id = $2
      ORDER BY r.created_at DESC
    `;

    const result = await pool.query(query, [item_type, item_id]);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('❌ Error en getItemReviews:', error);
    res.status(500).json({
      success: false,
      msg: 'Error al obtener reviews del item',
      error: error.message
    });
  }
};