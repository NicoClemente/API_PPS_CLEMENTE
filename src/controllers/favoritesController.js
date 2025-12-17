const pool = require('../config/database');

/**
 * Agregar un favorito
 */
exports.addFavorite = async (req, res) => {
  try {
    const { item_type, item_id, tmdb_id } = req.body;
    const user_id = req.user.id;

    if (!item_type || !item_id) {
      return res.status(400).json({
        success: false,
        msg: 'item_type e item_id son requeridos'
      });
    }

    const validTypes = ['movie', 'series', 'actor'];
    if (!validTypes.includes(item_type)) {
      return res.status(400).json({
        success: false,
        msg: 'item_type debe ser: movie, series o actor'
      });
    }

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
    const { type } = req.query;

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
 * Obtener favoritos con detalles completos (SIMPLIFICADO)
 */
exports.getUserFavoritesDetailed = async (req, res) => {
  try {
    const user_id = req.user.id;

    // Primero obtenemos los favoritos básicos
    const favoritesQuery = `
      SELECT * FROM favorites 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `;
    
    const favoritesResult = await pool.query(favoritesQuery, [user_id]);
    
    // Para cada favorito, obtenemos los detalles según su tipo
    const favoritesWithDetails = await Promise.all(
      favoritesResult.rows.map(async (fav) => {
        let details = null;
        
        try {
          if (fav.item_type === 'movie') {
            const movieQuery = `
              SELECT title, poster_path, release_date, vote_average 
              FROM movies 
              WHERE tmdb_id = $1 
              LIMIT 1
            `;
            const movieResult = await pool.query(movieQuery, [fav.tmdb_id]);
            details = movieResult.rows[0] || null;
          } 
          else if (fav.item_type === 'series') {
            const seriesQuery = `
              SELECT name, image_url as poster_path, premiered as first_air_date 
              FROM series 
              WHERE tmdb_id = $1 
              LIMIT 1
            `;
            const seriesResult = await pool.query(seriesQuery, [fav.tmdb_id]);
            if (seriesResult.rows[0]) {
              details = {
                ...seriesResult.rows[0],
                vote_average: 8.0
              };
            }
          }
          else if (fav.item_type === 'actor') {
            const actorQuery = `
              SELECT name, profile_path, known_for_department 
              FROM actors 
              WHERE tmdb_id = $1 
              LIMIT 1
            `;
            const actorResult = await pool.query(actorQuery, [fav.tmdb_id]);
            details = actorResult.rows[0] || null;
          }
        } catch (err) {
          console.error(`Error obteniendo detalles para ${fav.item_type}:`, err);
        }
        
        return {
          ...fav,
          details
        };
      })
    );

    res.json({
      success: true,
      data: favoritesWithDetails
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
      query = 'DELETE FROM favorites WHERE id = $1 AND user_id = $2 RETURNING *';
      params = [id, user_id];
    } else if (item_type && item_id) {
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