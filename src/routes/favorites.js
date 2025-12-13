const { Router } = require('express');
const {
  addFavorite,
  getUserFavorites,
  getUserFavoritesDetailed,
  deleteFavorite,
  removeFavorite
} = require('../controllers/favorites');

const router = Router();

/**
 * @route   POST /api/v1/favorites
 * @desc    Agregar un elemento a favoritos
 * @access  Requiere API_KEY
 * @body    user_id, item_type (movie|series|actor), item_id
 */
router.post('/', addFavorite);

/**
 * @route   GET /api/v1/favorites/user/:user_id
 * @desc    Obtener favoritos de un usuario
 * @access  Requiere API_KEY
 * @query   type - Filtrar por tipo (movie|series|actor) - Opcional
 */
router.get('/user/:user_id', getUserFavorites);

/**
 * @route   GET /api/v1/favorites/user/:user_id/detailed
 * @desc    Obtener favoritos con información detallada (JOIN)
 * @access  Requiere API_KEY
 */
router.get('/user/:user_id/detailed', getUserFavoritesDetailed);

/**
 * @route   DELETE /api/v1/favorites/:id
 * @desc    Eliminar un favorito por ID
 * @access  Requiere API_KEY
 */
router.delete('/:id', deleteFavorite);

/**
 * @route   DELETE /api/v1/favorites/remove
 * @desc    Eliminar favorito por usuario e item
 * @access  Requiere API_KEY
 * @body    user_id, item_type, item_id
 */
router.delete('/remove', removeFavorite);

module.exports = router;