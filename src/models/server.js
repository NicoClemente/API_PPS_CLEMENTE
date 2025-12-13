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
    // CORS - CONFIGURACIÓN ACTUALIZADA PARA PERMITIR PETICIONES DESDE FLUTTER WEB
    this.app.use(cors({
      origin: '*', // Permitir todas las origins (en producción especificar dominios)
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'X-API-KEY', 'Authorization'],
      credentials: true
    }));
    
    // Manejar preflight requests
    this.app.options('*', cors());
    
    // Archivos estáticos
    this.app.use(express.static('public'));
    
    // Parseo de JSON
    this.app.use(express.json());
    
    // Middleware de autenticación API_KEY (protege TODAS las rutas de la API)
    this.app.use('/api', validateApiKey);
  }

  rutas() {
    // ============================================
    // RUTAS CRUD CON BASE DE DATOS
    // ============================================
    
    // Películas (incluye CRUD + API externa)
    this.app.use('/api/v1/peliculas', require('../routes/movies'));
    
    // Series (incluye CRUD + API externa)
    this.app.use('/api/v1/series', require('../routes/series'));
    
    // Actores (incluye CRUD + API externa)
    this.app.use('/api/v1/actores', require('../routes/actors'));
    
    // Libros (solo API externa - opcional para el proyecto)
    this.app.use('/api/v1/libros', require('../routes/books'));
    
    // Usuarios (nuevo)
    this.app.use('/api/v1/users', require('../routes/users'));
    
    // Favoritos (nuevo)
    this.app.use('/api/v1/favorites', require('../routes/favorites'));

    // ============================================
    // MANEJO DE ERRORES
    // ============================================
    
    // Ruta raíz - información de la API
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
        auth: 'Todas las rutas /api requieren header X-API-KEY o query param api_key',
        docs: 'Ver README.md para documentación completa'
      });
    });
    
    // Rutas no encontradas
    this.app.use('*', (req, res) => {
      res.status(404).json({
        msg: 'Error',
        error: 'Ruta no encontrada',
        availableRoutes: [
          '/api/v1/peliculas',
          '/api/v1/series',
          '/api/v1/actores',
          '/api/v1/libros',
          '/api/v1/users',
          '/api/v1/favorites'
        ]
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
    
    // Manejo de cierre graceful
    process.on('SIGINT', () => {
      console.log('\n🛑 Cerrando servidor...');
      db.close()
        .then(() => {
          console.log('✅ Base de datos cerrada');
          process.exit(0);
        })
        .catch((err) => {
          console.error('❌ Error al cerrar la base de datos:', err);
          process.exit(1);
        });
    });
  }
}

module.exports = Server;