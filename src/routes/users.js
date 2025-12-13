const { Router } = require('express');
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} = require('../controllers/users');

const router = Router();

/**
 * @route   POST /api/v1/users
 * @desc    Crear un nuevo usuario
 * @access  Requiere API_KEY
 */
router.post('/', createUser);

/**
 * @route   GET /api/v1/users
 * @desc    Obtener todos los usuarios (paginado)
 * @access  Requiere API_KEY
 * @query   page - Número de página (default: 1)
 * @query   limit - Elementos por página (default: 20)
 */
router.get('/', getAllUsers);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Obtener un usuario por ID
 * @access  Requiere API_KEY
 */
router.get('/:id', getUserById);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Actualizar un usuario
 * @access  Requiere API_KEY
 */
router.put('/:id', updateUser);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Eliminar un usuario
 * @access  Requiere API_KEY
 */
router.delete('/:id', deleteUser);

module.exports = router;