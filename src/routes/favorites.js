const { Router } = require('express');
const router = Router();
const { authMiddleware } = require('../middleware/auth');
const favoritesController = require('../controllers/favoritesController');

// =====================================
// TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
// =====================================

// Agregar favorito
router.post('/', authMiddleware, favoritesController.addFavorite);

// Obtener todos los favoritos del usuario
router.get('/', authMiddleware, favoritesController.getUserFavorites);

// Obtener favoritos con detalles completos (para la pantalla de favoritos)
router.get('/detailed', authMiddleware, favoritesController.getUserFavoritesDetailed);

// Verificar si un item es favorito
router.get('/check', authMiddleware, favoritesController.checkFavorite);

// Toggle favorito (agregar o eliminar)
router.post('/toggle', authMiddleware, favoritesController.toggleFavorite);

// Eliminar favorito
router.delete('/', authMiddleware, favoritesController.deleteFavorite);

// Obtener favoritos por tipo
router.get('/user/:userId', authMiddleware, favoritesController.getUserFavoritesByType);

module.exports = router;