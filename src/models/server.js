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
    console.log('🌐 CORS habilitado para todos los orígenes');
    
    // ===== PASO 1: Headers CORS MANUALES (CRÍTICO - DEBE IR PRIMERO) =====
    this.app.use((req, res, next) => {
      // Headers CORS explícitos
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
      res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-API-KEY, Authorization');
      res.setHeader('Access-Control-Expose-Headers', 'Content-Length, X-API-KEY');
      res.setHeader('Access-Control-Max-Age', '86400');
      
      // Anti-cache headers (importante para proxies como Render/Cloudflare)
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
      
      // CRÍTICO: Responder inmediatamente a preflight OPTIONS sin validar API_KEY
      if (req.method === 'OPTIONS') {
        console.log(`✅ OPTIONS ${req.path} - Preflight OK`);
        return res.status(200).end();
      }
      
      next();
    });

    // ===== PASO 2: Middleware de CORS de Express (redundancia por seguridad) =====
    this.app.use(cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
      allowedHeaders: ['Content-Type', 'X-API-KEY', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
      exposedHeaders: ['Content-Length', 'X-API-KEY'],
      credentials: false,
      maxAge: 86400
    }));

    // ===== PASO 3: Parse JSON =====
    this.app.use(express.json());

    // ===== PASO 4: Logger =====
    this.app.use((req, res, next) => {
      console.log(`📥 ${req.method} ${req.path}`);
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
      // CRÍTICO: Permitir OPTIONS sin validar API_KEY (ya se manejó arriba pero por seguridad)
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
    this.app.use('/api/v1/peliculas', require('../routes/peliculasRoutes'));
    this.app.use('/api/v1/series', require('../routes/seriesRoutes'));
    this.app.use('/api/v1/actores', require('../routes/actoresRoutes'));
    this.app.use('/api/v1/favorites', require('../routes/favoritesRoutes'));
    this.app.use('/api/v1/users', require('../routes/usersRoutes'));

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