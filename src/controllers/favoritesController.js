const pool = require('../config/database');

/**
 * Agregar un favorito
 */
exports.addFavorite = async (req, res) => {
  try {
    const { item_type, item_id, tmdb_id } = req.body;
    const user_id = req.user.id; // Del middleware de autenticación

    // Validar datos
    if (!item_type || !item_id) {
      return res.status(400).json({
        success: false,
        msg: 'item_type e item_id son requeridos'
      });
    }

    // Validar item_type
    const validTypes = ['movie', 'series', 'actor'];
    if (!validTypes.includes(item_type)) {
      return res.status(400).json({
        success: false,
        msg: 'item_type debe ser: movie, series o actor'
      });
    }

    // Insertar favorito
    const query = `
      INSERT INTO favorites (user_id, item_type, item_id, tmdb_id)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, item_type, item_id) DO NOTHING
      RETURNING *
    `;

    const result = await pool.query(query, [user_id, item_type, item_id, tmdb_id || item_id]);

    if (result.rows.length === 0) {
      return res.status(200).json({
        success: true,
        msg: 'El favorito ya existía',
        data: null
      });
    }

    res.status(201).json({
      success: true,
      msg: 'Favorito agregado exitosamente',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error en addFavorite:', error);
    res.status(500).json({
      success: false,
      msg: 'Error al agregar favorito',
      error: error.message
    });
  }
};

/**
 * Obtener todos los favoritos del usuario
 */
exports.getUserFavorites = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { type } = req.query; // Filtrar por tipo (opcional)

    let query = 'SELECT * FROM favorites WHERE user_id = $1';
    const params = [user_id];

    if (type) {
      query += ' AND item_type = $2';
      params.push(type);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('❌ Error en getUserFavorites:', error);
    res.status(500).json({
      success: false,
      msg: 'Error al obtener favoritos',
      error: error.message
    });
  }
};

/**
 * Obtener favoritos con detalles completos (para la pantalla de favoritos)
 * Este endpoint devuelve los favoritos con los detalles del item desde las tablas movies/series/actors
 */
exports.getUserFavoritesDetailed = async (req, res) => {
  try {
    const user_id = req.user.id;

    const query = `
      SELECT 
        f.id,
        f.user_id,
        f.item_type,
        f.item_id,
        f.tmdb_id,
        f.created_at,
        CASE 
          WHEN f.item_type = 'movie' THEN json_build_object(
            'title', m.title,
            'poster_path', m.poster_path,
            'release_date', m.release_date,
            'vote_average', m.vote_average
          )
          WHEN f.item_type = 'series' THEN json_build_object(
            'name', s.name,
            'poster_path', s.image_url,
            'first_air_date', s.premiered,
            'vote_average', s.rating
          )
          WHEN f.item_type = 'actor' THEN json_build_object(
            'name', a.name,
            'profile_path', a.profile_path,
            'known_for_department', a.known_for_department
          )
        END as details
      FROM favorites f
      LEFT JOIN movies m ON f.item_type = 'movie' AND f.tmdb_id = m.tmdb_id
      LEFT JOIN series s ON f.item_type = 'series' AND f.tmdb_id = s.tmdb_id
      LEFT JOIN actors a ON f.item_type = 'actor' AND f.tmdb_id = a.tmdb_id
      WHERE f.user_id = $1
      ORDER BY f.created_at DESC
    `;

    const result = await pool.query(query, [user_id]);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('❌ Error en getUserFavoritesDetailed:', error);
    res.status(500).json({
      success: false,
      msg: 'Error al obtener favoritos detallados',
      error: error.message
    });
  }
};

/**
 * Verificar si un item es favorito
 */
exports.checkFavorite = async (req, res) => {
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
      SELECT EXISTS(
        SELECT 1 FROM favorites 
        WHERE user_id = $1 AND item_type = $2 AND item_id = $3
      ) as is_favorite
    `;

    const result = await pool.query(query, [user_id, item_type, item_id]);

    res.json({
      success: true,
      isFavorite: result.rows[0].is_favorite
    });

  } catch (error) {
    console.error('❌ Error en checkFavorite:', error);
    res.status(500).json({
      success: false,
      msg: 'Error al verificar favorito',
      error: error.message
    });
  }
};

/**
 * Toggle favorito (agregar o eliminar)
 */
exports.toggleFavorite = async (req, res) => {
  try {
    const { item_type, item_id, tmdb_id } = req.body;
    const user_id = req.user.id;

    // Validar datos
    if (!item_type || !item_id) {
      return res.status(400).json({
        success: false,
        msg: 'item_type e item_id son requeridos'
      });
    }

    // Verificar si existe
    const checkQuery = `
      SELECT * FROM favorites 
      WHERE user_id = $1 AND item_type = $2 AND item_id = $3
    `;
    const checkResult = await pool.query(checkQuery, [user_id, item_type, item_id]);

    if (checkResult.rows.length > 0) {
      // Ya existe, eliminar
      const deleteQuery = `
        DELETE FROM favorites 
        WHERE user_id = $1 AND item_type = $2 AND item_id = $3
        RETURNING *
      `;
      await pool.query(deleteQuery, [user_id, item_type, item_id]);

      return res.json({
        success: true,
        msg: 'Favorito eliminado',
        isFavorite: false
      });
    } else {
      // No existe, agregar
      const insertQuery = `
        INSERT INTO favorites (user_id, item_type, item_id, tmdb_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const insertResult = await pool.query(insertQuery, [user_id, item_type, item_id, tmdb_id || item_id]);

      return res.json({
        success: true,
        msg: 'Favorito agregado',
        isFavorite: true,
        data: insertResult.rows[0]
      });
    }

  } catch (error) {
    console.error('❌ Error en toggleFavorite:', error);
    res.status(500).json({
      success: false,
      msg: 'Error al toggle favorito',
      error: error.message
    });
  }
};

/**
 * Eliminar favorito
 */
exports.deleteFavorite = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { item_type, item_id, id } = req.body;

    let query, params;

    if (id) {
      // Eliminar por ID del favorito
      query = 'DELETE FROM favorites WHERE id = $1 AND user_id = $2 RETURNING *';
      params = [id, user_id];
    } else if (item_type && item_id) {
      // Eliminar por tipo e ID del item
      query = 'DELETE FROM favorites WHERE user_id = $1 AND item_type = $2 AND item_id = $3 RETURNING *';
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
        msg: 'Favorito no encontrado'
      });
    }

    res.json({
      success: true,
      msg: 'Favorito eliminado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error en deleteFavorite:', error);
    res.status(500).json({
      success: false,
      msg: 'Error al eliminar favorito',
      error: error.message
    });
  }
};

/**
 * Obtener favoritos por tipo (usado en Flutter)
 */
exports.getUserFavoritesByType = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { type } = req.query;

    let query = 'SELECT * FROM favorites WHERE user_id = $1';
    const params = [user_id];

    if (type && type !== 'all') {
      query += ' AND item_type = $2';
      params.push(type);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('❌ Error en getUserFavoritesByType:', error);
    res.status(500).json({
      success: false,
      msg: 'Error al obtener favoritos por tipo',
      error: error.message
    });
  }
};