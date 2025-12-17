const { Router } = require('express');
const router = Router();
const { authMiddleware } = require('../middleware/auth');
const reviewsController = require('../controllers/reviewsController');

// =====================================
// RUTAS PROTEGIDAS (requieren JWT)
// =====================================

/**
 * Crear o actualizar review
 * POST /api/v1/reviews
 */
router.post('/', authMiddleware, reviewsController.createOrUpdateReview);

/**
 * Obtener reviews del usuario
 * GET /api/v1/reviews
 */
router.get('/', authMiddleware, reviewsController.getUserReviews);

/**
 * Obtener una review específica
 * GET /api/v1/reviews/single
 */
router.get('/single', authMiddleware, reviewsController.getReview);

/**
 * Eliminar review
 * DELETE /api/v1/reviews
 */
router.delete('/', authMiddleware, reviewsController.deleteReview);

// =====================================
// RUTAS PÚBLICAS
// =====================================

/**
 * Obtener todas las reviews de un item
 * GET /api/v1/reviews/item
 */
router.get('/item', reviewsController.getItemReviews);

module.exports = router;