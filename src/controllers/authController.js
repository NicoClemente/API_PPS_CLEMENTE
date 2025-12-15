const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

/**
 * Registrar nuevo usuario
 * POST /auth/register
 */
exports.register = async (req, res) => {
    try {
        const { nombre, apellido, email, password, telefono } = req.body;

        // ============================================
        // VALIDACIONES
        // ============================================
        if (!nombre || !apellido || !email || !password) {
            return res.status(400).json({
                success: false,
                msg: 'Nombre, apellido, email y contraseña son obligatorios'
            });
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                msg: 'Email inválido'
            });
        }

        // Validar longitud de contraseña
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                msg: 'La contraseña debe tener al menos 6 caracteres'
            });
        }

        // ============================================
        // VERIFICAR SI EMAIL YA EXISTE
        // ============================================
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                success: false,
                msg: 'El email ya está registrado'
            });
        }

        // ============================================
        // ENCRIPTAR CONTRASEÑA
        // ============================================
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // ============================================
        // INSERTAR USUARIO
        // ============================================
        const result = await pool.query(
            `INSERT INTO users (nombre, apellido, email, password, telefono) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING id, nombre, apellido, email, telefono, created_at`,
            [nombre, apellido, email.toLowerCase(), hashedPassword, telefono]
        );

        const user = result.rows[0];

        // ============================================
        // GENERAR JWT
        // ============================================
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                nombre: user.nombre,
                apellido: user.apellido
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' } // Token válido por 7 días
        );

        console.log(`✅ Usuario registrado: ${user.email} (ID: ${user.id})`);

        res.status(201).json({
            success: true,
            msg: 'Usuario registrado exitosamente',
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                apellido: user.apellido,
                email: user.email,
                telefono: user.telefono,
                created_at: user.created_at
            }
        });

    } catch (error) {
        console.error('❌ Error en registro:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al registrar usuario',
            error: error.message
        });
    }
};

/**
 * Login de usuario
 * POST /auth/login
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // ============================================
        // VALIDACIONES
        // ============================================
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                msg: 'Email y contraseña son obligatorios'
            });
        }

        // ============================================
        // BUSCAR USUARIO POR EMAIL
        // ============================================
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                msg: 'Credenciales inválidas'
            });
        }

        const user = result.rows[0];

        // ============================================
        // VERIFICAR CONTRASEÑA
        // ============================================
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                msg: 'Credenciales inválidas'
            });
        }

        // ============================================
        // GENERAR JWT
        // ============================================
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                nombre: user.nombre,
                apellido: user.apellido
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        console.log(`✅ Login exitoso: ${user.email} (ID: ${user.id})`);

        res.json({
            success: true,
            msg: 'Login exitoso',
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                apellido: user.apellido,
                email: user.email,
                telefono: user.telefono,
                avatar_url: user.avatar_url,
                created_at: user.created_at
            }
        });

    } catch (error) {
        console.error('❌ Error en login:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al iniciar sesión',
            error: error.message
        });
    }
};

/**
 * Obtener perfil del usuario autenticado
 * GET /auth/profile
 * Requiere token JWT
 */
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id; // Viene del middleware authMiddleware

        const result = await pool.query(
            `SELECT id, nombre, apellido, email, telefono, avatar_url, created_at
             FROM users WHERE id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                msg: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            user: result.rows[0]
        });

    } catch (error) {
        console.error('❌ Error al obtener perfil:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al obtener perfil',
            error: error.message
        });
    }
};

/**
 * Actualizar perfil del usuario
 * PUT /auth/profile
 * Requiere token JWT
 */
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { nombre, apellido, telefono } = req.body;

        // Construir query dinámicamente solo con campos que vienen en el body
        const updates = [];
        const values = [];
        let paramCounter = 1;

        if (nombre !== undefined) {
            updates.push(`nombre = $${paramCounter++}`);
            values.push(nombre);
        }
        if (apellido !== undefined) {
            updates.push(`apellido = $${paramCounter++}`);
            values.push(apellido);
        }
        if (telefono !== undefined) {
            updates.push(`telefono = $${paramCounter++}`);
            values.push(telefono);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                msg: 'No se proporcionaron campos para actualizar'
            });
        }

        values.push(userId);

        const query = `
            UPDATE users 
            SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${paramCounter}
            RETURNING id, nombre, apellido, email, telefono, avatar_url, created_at, updated_at
        `;

        const result = await pool.query(query, values);

        console.log(`✅ Perfil actualizado: Usuario ID ${userId}`);

        res.json({
            success: true,
            msg: 'Perfil actualizado exitosamente',
            user: result.rows[0]
        });

    } catch (error) {
        console.error('❌ Error al actualizar perfil:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al actualizar perfil',
            error: error.message
        });
    }
};

/**
 * Cambiar contraseña
 * PUT /auth/change-password
 * Requiere token JWT
 */
exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        // Validaciones
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                msg: 'Contraseña actual y nueva son obligatorias'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                msg: 'La nueva contraseña debe tener al menos 6 caracteres'
            });
        }

        // Obtener usuario con contraseña
        const result = await pool.query(
            'SELECT password FROM users WHERE id = $1',
            [userId]
        );

        const user = result.rows[0];

        // Verificar contraseña actual
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                msg: 'Contraseña actual incorrecta'
            });
        }

        // Encriptar nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Actualizar contraseña
        await pool.query(
            'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [hashedPassword, userId]
        );

        console.log(`✅ Contraseña actualizada: Usuario ID ${userId}`);

        res.json({
            success: true,
            msg: 'Contraseña actualizada exitosamente'
        });

    } catch (error) {
        console.error('❌ Error al cambiar contraseña:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al cambiar contraseña',
            error: error.message
        });
    }
};