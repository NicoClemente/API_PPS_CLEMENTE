const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// ============================================
// RUTAS PÚBLICAS (no requieren autenticación)
// ============================================

/**
 * Registrar nuevo usuario
 * POST /auth/register
 * Body: { nombre, apellido, email, password, telefono }
 */
router.post('/register', authController.register);

/**
 * Login de usuario
 * POST /auth/login
 * Body: { email, password }
 */
router.post('/login', authController.login);

// ============================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ============================================

/**
 * Obtener perfil del usuario autenticado
 * GET /auth/profile
 * Headers: Authorization: Bearer <token>
 */
router.get('/profile', authMiddleware, authController.getProfile);

/**
 * Actualizar perfil del usuario
 * PUT /auth/profile
 * Headers: Authorization: Bearer <token>
 * Body: { nombre?, apellido?, telefono? }
 */
router.put('/profile', authMiddleware, authController.updateProfile);

/**
 * Cambiar contraseña
 * PUT /auth/change-password
 * Headers: Authorization: Bearer <token>
 * Body: { currentPassword, newPassword }
 */
router.put('/change-password', authMiddleware, authController.changePassword);

module.exports = router;