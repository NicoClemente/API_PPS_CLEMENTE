/**
 * Middleware de Autenticación con API_KEY
 * Protege todas las rutas de la API
 */

const validateApiKey = (req, res, next) => {
  // Obtener API_KEY del header
  const apiKey = req.header('X-API-KEY') || req.query.api_key;
  
  // API_KEY esperada (en producción debería estar en .env)
  const validApiKey = process.env.API_KEY;

  // Validar que existe
  if (!apiKey) {
    return res.status(401).json({
      msg: 'Error',
      error: 'API_KEY requerida. Incluya el header X-API-KEY o el query param api_key'
    });
  }

  // Validar que es correcta
  if (apiKey !== validApiKey) {
    return res.status(403).json({
      msg: 'Error',
      error: 'API_KEY inválida'
    });
  }

  // Si todo está bien, continuar
  next();
};

module.exports = {
  validateApiKey
};