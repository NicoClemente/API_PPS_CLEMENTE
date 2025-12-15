const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar el token JWT
 * Extrae el token del header Authorization y verifica su validez
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        msg: 'Token no proporcionado. Use: Authorization: Bearer <token>'
      });
    }

    // Extraer el token (después de "Bearer ")
    const token = authHeader.substring(7);

    // Verificar el token con la clave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Agregar información del usuario a la request
    // Ahora cualquier ruta puede acceder a req.user
    req.user = decoded;

    console.log(`✅ Usuario autenticado: ${decoded.email} (ID: ${decoded.id})`);

    next();
  } catch (error) {
    console.error('❌ Error en auth middleware:', error.message);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        msg: 'Token inválido'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        msg: 'Token expirado. Por favor inicie sesión nuevamente'
      });
    }

    return res.status(500).json({
      success: false,
      msg: 'Error al verificar token',
      error: error.message
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      console.log(`✅ Usuario autenticado (opcional): ${decoded.email}`);
    } else {
      console.log('ℹ️  Request sin autenticación (permitido)');
    }

    next();
  } catch (error) {
    // Si hay error, simplemente continuar sin autenticar
    console.log('ℹ️  Token inválido o expirado (ignorado en ruta opcional)');
    next();
  }
};

module.exports = {
  authMiddleware,
  optionalAuth
};