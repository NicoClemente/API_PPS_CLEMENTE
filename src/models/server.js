const express = require('express');
const cors = require('cors');

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;

    // Middleware
    this.middleware();

    // Rutas
    this.routes();
  }

  middleware() {
    console.log('🌐 CORS habilitado para Flutter Web');
    
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
        console.log(`✅ PREFLIGHT ${req.path} from ${origin}`);
        return res.status(204).end();
      }
      
      next();
    });

    this.app.use(cors({
      origin: true,
      credentials: true,
      optionsSuccessStatus: 204
    }));

    // Parse JSON
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Logger
    this.app.use((req, res, next) => {
      console.log(`📥 ${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`);
      next();
    });
  }

  routes() {
    // Ruta de salud
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'FlixFinder API - PPS Clemente',
        version: '1.0.0',
        endpoints: {
          peliculas: '/api/v1/peliculas',
          series: '/api/v1/series',
          actores: '/api/v1/actores',
          favorites: '/api/v1/favorites',
          users: '/api/v1/users'
        }
      });
    });

    // ===== Middleware de validación de API_KEY (SOLO para rutas /api) =====
    this.app.use('/api', (req, res, next) => {
      // CRÍTICO: Permitir OPTIONS sin validar API_KEY
      if (req.method === 'OPTIONS') {
        return next();
      }
      
      // Validar API_KEY para otros métodos
      const apiKey = req.headers['x-api-key'];
      const validApiKey = process.env.API_KEY;
      
      if (!apiKey) {
        console.log('❌ API_KEY faltante');
        return res.status(401).json({
          success: false,
          error: 'API_KEY requerida en header X-API-KEY'
        });
      }
      
      if (apiKey !== validApiKey) {
        console.log('❌ API_KEY inválida:', apiKey);
        return res.status(401).json({
          success: false,
          error: 'API_KEY inválida'
        });
      }
      
      console.log('✅ API_KEY válida');
      next();
    });

    // ===== Rutas de la API =====
    this.app.use('/api/v1/peliculas', require('../routes/movies'));
    this.app.use('/api/v1/series', require('../routes/series'));
    this.app.use('/api/v1/actores', require('../routes/actors'));
    this.app.use('/api/v1/favorites', require('../routes/favorites'));
    this.app.use('/api/v1/users', require('../routes/users'));

    // ===== Ruta 404 =====
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint no encontrado'
      });
    });
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log('🚀 ====================================');
      console.log(`🚀 Servidor corriendo en puerto ${this.port}`);
      console.log(`🚀 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log('🚀 ====================================');
    });
  }
}

module.exports = Server;