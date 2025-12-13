const { request, response } = require('express');
const { run, get, all } = require('../config/database');

/**
 * Agregar un favorito
 * POST /api/v1/favorites
 */
const addFavorite = async (req = request, res = response) => {
  try {
    const { user_id, item_type, item_id } = req.body;

    // Validaciones
    if (!user_id || !item_type || !item_id) {
      return res.status(400).json({
        msg: 'Error',
        error: 'user_id, item_type e item_id son requeridos'
      });
    }

    // Validar item_type
    const validTypes = ['movie', 'series', 'actor'];
    if (!validTypes.includes(item_type)) {
      return res.status(400).json({
        msg: 'Error',
        error: 'item_type debe ser: movie, series o actor'
      });
    }

    // Verificar que el usuario existe
    const userExists = await get('SELECT id FROM users WHERE id = ?', [user_id]);
    if (!userExists) {
      return res.status(404).json({
        msg: 'Error',
        error: 'Usuario no encontrado'
      });
    }

    // Verificar si ya existe el favorito
    const existing = await get(
      'SELECT id FROM favorites WHERE user_id = ? AND item_type = ? AND item_id = ?',
      [user_id, item_type, item_id]
    );

    if (existing) {
      return res.status(409).json({
        msg: 'Error',
        error: 'Este elemento ya está en favoritos',
        data: { id: existing.id }
      });
    }

    // Insertar favorito
    const result = await run(
      'INSERT INTO favorites (user_id, item_type, item_id) VALUES (?, ?, ?)',
      [user_id, item_type, item_id]
    );

    res.status(201).json({
      msg: 'Favorito agregado exitosamente',
      data: {
        id: result.id,
        user_id,
        item_type,
        item_id
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: 'Error',
      error: 'Error al agregar el favorito'
    });
  }
};

/**
 * Obtener todos los favoritos de un usuario
 * GET /api/v1/favorites/user/:user_id
 */
const getUserFavorites = async (req = request, res = response) => {
  try {
    const { user_id } = req.params;
    const { type } = req.query; // Opcional: filtrar por tipo

    // Verificar que el usuario existe
    const userExists = await get('SELECT id FROM users WHERE id = ?', [user_id]);
    if (!userExists) {
      return res.status(404).json({
        msg: 'Error',
        error: 'Usuario no encontrado'
      });
    }

    let query = 'SELECT * FROM favorites WHERE user_id = ?';
    let params = [user_id];

    if (type) {
      query += ' AND item_type = ?';
      params.push(type);
    }

    query += ' ORDER BY created_at DESC';

    const favorites = await all(query, params);

    res.status(200).json({
      msg: 'Ok',
      data: favorites,
      count: favorites.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: 'Error',
      error: 'Error al obtener los favoritos'
    });
  }
};

/**
 * Obtener favoritos con detalles completos (JOIN con las tablas)
 * GET /api/v1/favorites/user/:user_id/detailed
 */
const getUserFavoritesDetailed = async (req = request, res = response) => {
  try {
    const { user_id } = req.params;

    // Verificar que el usuario existe
    const userExists = await get('SELECT id FROM users WHERE id = ?', [user_id]);
    if (!userExists) {
      return res.status(404).json({
        msg: 'Error',
        error: 'Usuario no encontrado'
      });
    }

    // Obtener favoritos
    const favorites = await all(
      'SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC',
      [user_id]
    );

    // Enriquecer con detalles
    const detailedFavorites = await Promise.all(
      favorites.map(async (fav) => {
        let details = null;

        if (fav.item_type === 'movie') {
          details = await get('SELECT * FROM movies WHERE id = ?', [fav.item_id]);
          if (details) {
            details.genre_ids = JSON.parse(details.genre_ids || '[]');
          }
        } else if (fav.item_type === 'series') {
          details = await get('SELECT * FROM series WHERE id = ?', [fav.item_id]);
          if (details) {
            details.genres = JSON.parse(details.genres || '[]');
          }
        } else if (fav.item_type === 'actor') {
          details = await get('SELECT * FROM actors WHERE id = ?', [fav.item_id]);
          if (details) {
            details.known_for = JSON.parse(details.known_for || '[]');
          }
        }

        return {
          ...fav,
          details
        };
      })
    );

    res.status(200).json({
      msg: 'Ok',
      data: detailedFavorites,
      count: detailedFavorites.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: 'Error',
      error: 'Error al obtener los favoritos detallados'
    });
  }
};

/**
 * Eliminar un favorito
 * DELETE /api/v1/favorites/:id
 */
const deleteFavorite = async (req = request, res = response) => {
  try {
    const { id } = req.params;

    // Verificar que el favorito existe
    const existing = await get('SELECT id FROM favorites WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        msg: 'Error',
        error: 'Favorito no encontrado'
      });
    }

    // Eliminar favorito
    await run('DELETE FROM favorites WHERE id = ?', [id]);

    res.status(200).json({
      msg: 'Favorito eliminado exitosamente',
      data: { id }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: 'Error',
      error: 'Error al eliminar el favorito'
    });
  }
};

/**
 * Eliminar favorito por usuario e item
 * DELETE /api/v1/favorites/remove
 */
const removeFavorite = async (req = request, res = response) => {
  try {
    const { user_id, item_type, item_id } = req.body;

    if (!user_id || !item_type || !item_id) {
      return res.status(400).json({
        msg: 'Error',
        error: 'user_id, item_type e item_id son requeridos'
      });
    }

    // Buscar y eliminar
    const result = await run(
      'DELETE FROM favorites WHERE user_id = ? AND item_type = ? AND item_id = ?',
      [user_id, item_type, item_id]
    );

    if (result.changes === 0) {
      return res.status(404).json({
        msg: 'Error',
        error: 'Favorito no encontrado'
      });
    }

    res.status(200).json({
      msg: 'Favorito eliminado exitosamente'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: 'Error',
      error: 'Error al eliminar el favorito'
    });
  }
};

module.exports = {
  addFavorite,
  getUserFavorites,
  getUserFavoritesDetailed,
  deleteFavorite,
  removeFavorite
};