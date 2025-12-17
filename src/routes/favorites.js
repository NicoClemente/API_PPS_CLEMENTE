const { Router } = require('express');
const router = Router();
const { authMiddleware } = require('../middleware/auth');
const favoritesController = require('../controllers/favoritesController');

// =====================================
// RUTAS PROTEGIDAS (requieren JWT)
// =====================================

/**
 * Agregar un favorito
 * POST /api/v1/favorites
 */
router.post('/', authMiddleware, favoritesController.addFavorite);

/**
 * Toggle favorito (agregar o eliminar)
 * POST /api/v1/favorites/toggle
 */
router.post('/toggle', authMiddleware, favoritesController.toggleFavorite);

/**
 * Obtener favoritos del usuario
 * GET /api/v1/favorites
 */
router.get('/', authMiddleware, favoritesController.getUserFavorites);

/**
 * Obtener favoritos con detalles completos
 * GET /api/v1/favorites/detailed
 */
router.get('/detailed', authMiddleware, favoritesController.getUserFavoritesDetailed);

/**
 * Verificar si un item es favorito
 * GET /api/v1/favorites/check
 */
router.get('/check', authMiddleware, favoritesController.checkFavorite);

/**
 * Eliminar favorito
 * DELETE /api/v1/favorites
 */
router.delete('/', authMiddleware, favoritesController.deleteFavorite);

module.exports = router;