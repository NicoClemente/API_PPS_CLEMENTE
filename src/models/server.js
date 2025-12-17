const express = require('express');
const cors = require('cors');

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;

    // Validar variables de entorno críticas
    this.validateEnvironment();

    this.middleware();
    this.routes();
  }

  validateEnvironment() {
    const required = ['DATABASE_URL', 'JWT_SECRET', 'API_KEY'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      console.error('❌ ERROR: Variables de entorno faltantes:');
      missing.forEach(key => console.error(`   - ${key}`));
      console.error('💡 Revisa tu archivo .env');
      process.exit(1);
    }
  }

  middleware() {
    console.log('🌐 Configurando CORS para Flutter Web');
    
    this.app.use((req, res, next) => {
      const origin = req.headers.origin;
      
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
      res.setHeader('Access-Control-Allow-Headers', 
        'Origin, X-Requested-With, Content-Type, Accept, X-API-KEY, Authorization, Cache-Control, Pragma'
      );
      res.setHeader('Access-Control-Expose-Headers', 'Content-Length, X-API-KEY');
      res.setHeader('Access-Control-Max-Age', '86400');
      
      if (req.method === 'OPTIONS') {
        console.log(`✅ PREFLIGHT ${req.path} from ${origin || 'unknown'}`);
        return res.status(204).end();
      }
      
      next();
    });

    this.app.use(cors({
      origin: true,
      credentials: true,
      optionsSuccessStatus: 204
    }));

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    this.app.use((req, res, next) => {
      console.log(`📥 ${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`);
      next();
    });
  }

  routes() {
    // RUTAS PÚBLICAS
    this.app.get('/', (req, res) => {
      console.log('✅ GET / - Ruta raíz accedida');
      res.json({
        success: true,
        message: 'FlixFinder API - PPS Clemente',
        version: '3.1.0',
        database: 'PostgreSQL (Neon v17)',
        status: 'online',
        timestamp: new Date().toISOString(),
        endpoints: {
          public: {
            '/': 'Información de la API',
            '/health': 'Estado del servidor'
          },
          auth: {
            'POST /auth/register': 'Registrar usuario',
            'POST /auth/login': 'Iniciar sesión',
            'GET /auth/profile': 'Obtener perfil (requiere JWT)',
            'PUT /auth/profile': 'Actualizar perfil (requiere JWT)'
          },
          protected: {
            'GET /api/v1/peliculas': 'Películas (requiere API_KEY)',
            'GET /api/v1/series': 'Series (requiere API_KEY)',
            'GET /api/v1/actores': 'Actores (requiere API_KEY)',
            'GET /api/v1/users': 'Usuarios (requiere API_KEY)',
            'GET /api/v1/favorites': 'Favoritos (requiere API_KEY + JWT)',
            'POST /api/v1/reviews': 'Reviews (requiere API_KEY + JWT)'
          }
        }
      });
    });

    this.app.get('/health', (req, res) => {
      res.json({ 
        success: true,
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime())
      });
    });

    // RUTAS DE AUTENTICACIÓN (sin API_KEY)
    const authRoutes = require('../routes/authRoutes');
    this.app.use('/auth', authRoutes);

    // MIDDLEWARE DE API_KEY
    this.app.use('/api', (req, res, next) => {
      if (req.method === 'OPTIONS') {
        return next();
      }
      
      const apiKey = req.headers['x-api-key'];
      
      if (!apiKey) {
        console.log('❌ API_KEY faltante');
        return res.status(401).json({
          success: false,
          msg: 'API_KEY requerida en header X-API-KEY'
        });
      }
      
      if (apiKey !== process.env.API_KEY) {
        console.log('❌ API_KEY inválida');
        return res.status(403).json({
          success: false,
          msg: 'API_KEY inválida'
        });
      }
      
      console.log('✅ API_KEY válida');
      next();
    });

    // RUTAS PROTEGIDAS
    this.app.use('/api/v1/peliculas', require('../routes/movies'));
    this.app.use('/api/v1/series', require('../routes/series'));
    this.app.use('/api/v1/actores', require('../routes/actors'));
    this.app.use('/api/v1/users', require('../routes/users'));
    this.app.use('/api/v1/favorites', require('../routes/favorites'));
    this.app.use('/api/v1/reviews', require('../routes/reviews'));

    // 404
    this.app.use((req, res) => {
      console.log(`❌ 404 - Ruta no encontrada: ${req.method} ${req.path}`);
      res.status(404).json({
        success: false,
        error: 'Endpoint no encontrado',
        path: req.path,
        method: req.method
      });
    });
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log('🚀 ====================================');
      console.log(`🚀 Servidor corriendo en puerto ${this.port}`);
      console.log(`🚀 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log('🚀 Database: PostgreSQL (Neon v17)');
      console.log('🚀 CORS habilitado para Flutter Web');
      console.log('🚀 API_KEY: ACTIVADA ✅');
      console.log('🚀 JWT Auth: ACTIVADA ✅');
      console.log('🚀 Reviews: ACTIVADAS ✅');
      console.log('🚀 ====================================');
    });
  }
}

module.exports = Server;