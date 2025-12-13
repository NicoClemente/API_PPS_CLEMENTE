const express = require('express');
const cors = require('cors');
const { validateApiKey } = require('../middlewares/auth');
const db = require('../config/database');

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.middleware();
    this.rutas();
  }

  middleware() {
    // CORS - PERMITIR TODAS LAS PETICIONES (ANTES que todo)
    this.app.use(cors({
      origin: function(origin, callback) {
        callback(null, true);
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'X-API-KEY', 'Authorization'],
      credentials: false,
      optionsSuccessStatus: 200
    }));

    // Manejo explícito de preflight OPTIONS
    this.app.options('*', cors());
    
    // Archivos estáticos
    this.app.use(express.static('public'));
    
    // Parseo de JSON
    this.app.use(express.json());
    
    // Middleware de autenticación API_KEY (SOLO para rutas /api)
    this.app.use('/api', (req, res, next) => {
      if (req.method === 'OPTIONS') {
        next();
      } else {
        validateApiKey(req, res, next);
      }
    });
  }

  rutas() {
    // Películas
    this.app.use('/api/v1/peliculas', require('../routes/movies'));
    
    // Series
    this.app.use('/api/v1/series', require('../routes/series'));
    
    // Actores
    this.app.use('/api/v1/actores', require('../routes/actors'));
    
    // Libros
    this.app.use('/api/v1/libros', require('../routes/books'));
    
    // Usuarios
    this.app.use('/api/v1/users', require('../routes/users'));
    
    // Favoritos
    this.app.use('/api/v1/favorites', require('../routes/favorites'));

    // Ruta raíz
    this.app.get('/', (req, res) => {
      res.json({
        msg: 'FlixFinder API v2.0 - Proyecto Final PPS',
        endpoints: {
          peliculas: '/api/v1/peliculas',
          series: '/api/v1/series',
          actores: '/api/v1/actores',
          libros: '/api/v1/libros',
          usuarios: '/api/v1/users',
          favoritos: '/api/v1/favorites'
        },
        auth: 'Todas las rutas /api requieren header X-API-KEY',
        docs: 'Ver README.md'
      });
    });
    
    // 404
    this.app.use('*', (req, res) => {
      res.status(404).json({
        msg: 'Error',
        error: 'Ruta no encontrada'
      });
    });
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log('================================================');
      console.log('🚀 FlixFinder API - Proyecto Final PPS');
      console.log('================================================');
      console.log(`✅ Servidor corriendo en puerto ${this.port}`);
      console.log(`🔗 http://localhost:${this.port}`);
      console.log(`🔐 API_KEY requerida para todas las rutas /api`);
      console.log('================================================');
    });
    
    process.on('SIGINT', () => {
      console.log('\n🛑 Cerrando servidor...');
      db.close()
        .then(() => {
          console.log('✅ Base de datos cerrada');
          process.exit(0);
        })
        .catch((err) => {
          console.error('❌ Error al cerrar:', err);
          process.exit(1);
        });
    });
  }
}

module.exports = Server;