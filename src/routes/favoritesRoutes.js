const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favoritesController');
const { authMiddleware } = require('../middleware/auth');

/**
 * Agregar a favoritos
 * POST /api/v1/favorites
 * Headers: 
 *   - X-API-KEY: <api_key>
 *   - Authorization: Bearer <token>
 * Body: { item_type, item_id, tmdb_id }
 */
router.post('/', authMiddleware, favoritesController.addFavorite);

/**
 * Obtener favoritos del usuario autenticado
 * GET /api/v1/favorites
 * Query: ?type=movie (opcional)
 * Headers: 
 *   - X-API-KEY: <api_key>
 *   - Authorization: Bearer <token>
 */
router.get('/', authMiddleware, favoritesController.getUserFavorites);

/**
 * Obtener favoritos con detalles completos
 * GET /api/v1/favorites/detailed
 * Headers: 
 *   - X-API-KEY: <api_key>
 *   - Authorization: Bearer <token>
 */
router.get('/detailed', authMiddleware, favoritesController.getUserFavoritesDetailed);

/**
 * Obtener estadísticas de favoritos
 * GET /api/v1/favorites/stats
 * Headers: 
 *   - X-API-KEY: <api_key>
 *   - Authorization: Bearer <token>
 */
router.get('/stats', authMiddleware, favoritesController.getFavoritesStats);

/**
 * Verificar si un item está en favoritos
 * GET /api/v1/favorites/check?item_type=movie&item_id=550
 * Headers: 
 *   - X-API-KEY: <api_key>
 *   - Authorization: Bearer <token>
 */
router.get('/check', authMiddleware, favoritesController.checkFavorite);

/**
 * Toggle favorito (agregar/eliminar)
 * POST /api/v1/favorites/toggle
 * Headers: 
 *   - X-API-KEY: <api_key>
 *   - Authorization: Bearer <token>
 * Body: { item_type, item_id, tmdb_id }
 */
router.post('/toggle', authMiddleware, favoritesController.toggleFavorite);

/**
 * Eliminar de favoritos
 * DELETE /api/v1/favorites
 * Headers: 
 *   - X-API-KEY: <api_key>
 *   - Authorization: Bearer <token>
 * Body: { item_type, item_id }
 */
router.delete('/', authMiddleware, favoritesController.removeFavorite);

module.exports = router;