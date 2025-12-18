const { request, response } = require('express');
const pool = require('../config/database');

/**
 * Crear un nuevo usuario
 * POST /api/v1/users
 */
const createUser = async (req = request, res = response) => {
  try {
    const { nombre, apellido, email, telefono } = req.body;

    // Validaciones
    if (!nombre || !apellido || !email) {
      return res.status(400).json({
        msg: 'Error',
        error: 'nombre, apellido y email son requeridos'
      });
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        msg: 'Error',
        error: 'Formato de email inválido'
      });
    }

    // Verificar si el email ya existe
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        msg: 'Error',
        error: 'El email ya está registrado',
        data: { id: existing.rows[0].id }
      });
    }

    // Insertar usuario
    const result = await pool.query(
      'INSERT INTO users (nombre, apellido, email, telefono) VALUES ($1, $2, $3, $4) RETURNING id',
      [nombre, apellido, email, telefono || null]
    );

    res.status(201).json({
      msg: 'Usuario creado exitosamente',
      data: {
        id: result.rows[0].id,
        nombre,
        apellido,
        email,
        telefono
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: 'Error',
      error: 'Error al crear el usuario'
    });
  }
};

/**
 * Obtener todos los usuarios
 * GET /api/v1/users
 */
const getAllUsers = async (req = request, res = response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const users = await pool.query(
      'SELECT id, nombre, apellido, email, telefono, created_at, updated_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [parseInt(limit), parseInt(offset)]
    );

    const total = await pool.query('SELECT COUNT(*) as count FROM users');

    res.status(200).json({
      msg: 'Ok',
      data: users.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total.rows[0].count)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: 'Error',
      error: 'Error al obtener los usuarios'
    });
  }
};

/**
 * Obtener un usuario por ID
 * GET /api/v1/users/:id
 */
const getUserById = async (req = request, res = response) => {
  try {
    const { id } = req.params;

    const user = await pool.query(
      'SELECT id, nombre, apellido, email, telefono, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({
        msg: 'Error',
        error: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      msg: 'Ok',
      data: user.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: 'Error',
      error: 'Error al obtener el usuario'
    });
  }
};

/**
 * Actualizar un usuario
 * PUT /api/v1/users/:id
 */
const updateUser = async (req = request, res = response) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, email, telefono } = req.body;

    // Verificar que el usuario existe
    const existing = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({
        msg: 'Error',
        error: 'Usuario no encontrado'
      });
    }

    // Si se está actualizando el email, verificar que no esté en uso por otro usuario
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          msg: 'Error',
          error: 'Formato de email inválido'
        });
      }

      const emailExists = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, id]);
      if (emailExists.rows.length > 0) {
        return res.status(409).json({
          msg: 'Error',
          error: 'El email ya está en uso por otro usuario'
        });
      }
    }

    // Actualizar usuario
    await pool.query(
      `UPDATE users 
       SET nombre = COALESCE($1, nombre),
           apellido = COALESCE($2, apellido),
           email = COALESCE($3, email),
           telefono = COALESCE($4, telefono)
       WHERE id = $5`,
      [nombre, apellido, email, telefono, id]
    );

    // Obtener usuario actualizado
    const updatedUser = await pool.query(
      'SELECT id, nombre, apellido, email, telefono, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );

    res.status(200).json({
      msg: 'Usuario actualizado exitosamente',
      data: updatedUser.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: 'Error',
      error: 'Error al actualizar el usuario'
    });
  }
};

/**
 * Eliminar un usuario
 * DELETE /api/v1/users/:id
 */
const deleteUser = async (req = request, res = response) => {
  try {
    const { id } = req.params;

    // Verificar que el usuario existe
    const existing = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({
        msg: 'Error',
        error: 'Usuario no encontrado'
      });
    }

    // Eliminar usuario (los favoritos se eliminan automáticamente por CASCADE)
    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    res.status(200).json({
      msg: 'Usuario eliminado exitosamente',
      data: { id }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: 'Error',
      error: 'Error al eliminar el usuario'
    });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
};