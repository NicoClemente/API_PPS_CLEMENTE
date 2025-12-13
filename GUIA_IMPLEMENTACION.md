# 🚀 GUÍA DE IMPLEMENTACIÓN - Proyecto PPS FlixFinder

## Resumen Ejecutivo

Cree una adaptación completa de tu proyecto actual para cumplir con los requerimientos del PPS. Los archivos están organizados y listos para integrar.

---

## 📦 ARCHIVOS GENERADOS

### 1. **Documentación**
- ✅ `docs/DIAGRAMA_ER.md` - Diagrama Entidad-Relación completo
- ✅ `README_BACKEND.md` - Documentación completa del backend
- ✅ `GUIA_IMPLEMENTACION.md` - Este archivo

### 2. **Base de Datos**
- ✅ `database/schema.sql` - Schema completo SQLite3
- ✅ `src/config/database.js` - Configuración y helpers de BD

### 3. **Middleware & Seguridad**
- ✅ `src/middlewares/auth.js` - Protección con API_KEY

### 4. **Controladores CRUD**
- ✅ `src/controllers/movies_crud.js` - CRUD completo de películas
- ✅ `src/controllers/users.js` - CRUD de usuarios
- ✅ `src/controllers/favorites.js` - Sistema de favoritos

### 5. **Rutas**
- ✅ `src/routes/users.js` - Rutas de usuarios
- ✅ `src/routes/favorites.js` - Rutas de favoritos

### 6. **Configuración**
- ✅ `package.json` - Dependencias actualizadas
- ✅ `.env.example` - Variables de entorno
- ✅ `src/models/server_updated.js` - Server con BD y autenticación

---

## 🔧 PASOS DE IMPLEMENTACIÓN

### PASO 1: Preparar el Backend

```bash
# 1. Navegar a tu carpeta de backend
cd ruta/a/tu/backend

# 2. Instalar nueva dependencia (SQLite3)
npm install sqlite3@^5.1.7

# 3. Crear estructura de carpetas
mkdir -p database docs src/middlewares

# 4. Copiar archivos generados
# Copiar todos los archivos de /mnt/user-data/outputs a tu proyecto
```

### PASO 2: Actualizar Archivos Existentes

#### A) Reemplazar `src/models/server.js`
```bash
# Hacer backup del archivo original
cp src/models/server.js src/models/server_backup.js

# Reemplazar con la nueva versión
cp src/models/server_updated.js src/models/server.js
```

#### B) Actualizar `package.json`
```bash
# Hacer backup
cp package.json package_backup.json

# Copiar el nuevo package.json
# Luego ejecutar:
npm install
```

#### C) Actualizar `.env`
```bash
# Agregar al final de tu .env existente:
API_KEY=flixfinder_api_key_2024_grupo3_pps
```

### PASO 3: Integrar Nuevos Módulos

#### A) Copiar archivos de configuración
```bash
cp database/schema.sql tu_proyecto/database/
cp src/config/database.js tu_proyecto/src/config/
cp src/middlewares/auth.js tu_proyecto/src/middlewares/
```

#### B) Copiar controladores
```bash
cp src/controllers/users.js tu_proyecto/src/controllers/
cp src/controllers/favorites.js tu_proyecto/src/controllers/
cp src/controllers/movies_crud.js tu_proyecto/src/controllers/
```

#### C) Copiar rutas
```bash
cp src/routes/users.js tu_proyecto/src/routes/
cp src/routes/favorites.js tu_proyecto/src/routes/
```

### PASO 4: Actualizar Rutas de Películas

Editar `src/routes/movies.js` para incluir las nuevas rutas CRUD:

```javascript
const { Router } = require('express');
const {
  // Funciones existentes (TMDb)
  getPopularMovies,
  getMovieById,
  getMoviesByGenre,
  getGenresList,
  searchMovies,
  // Nuevas funciones CRUD
  createMovie,
  getMoviesFromDB,
  getMovieFromDBById,
  updateMovie,
  deleteMovie
} = require('../controllers/movies_crud');

const router = Router();

// Rutas TMDb (existentes)
router.get('/', getPopularMovies);
router.get('/generos', (req, res, next) => {
  if (req.query.genre) {
    getMoviesByGenre(req, res, next);
  } else {
    getGenresList(req, res, next);
  }
});
router.get('/buscar', searchMovies);
router.get('/:id', getMovieById);

// Nuevas rutas CRUD
router.post('/db', createMovie);
router.get('/db', getMoviesFromDB);
router.get('/db/:id', getMovieFromDBById);
router.put('/db/:id', updateMovie);
router.delete('/db/:id', deleteMovie);

module.exports = router;
```

### PASO 5: Verificar Instalación

```bash
# 1. Iniciar el servidor
npm start

# 2. Verificar logs
# Deberías ver:
# ✅ Conectado a la base de datos SQLite
# ✅ Schema de base de datos cargado correctamente
# ✅ Servidor corriendo en puerto 3000

# 3. Probar endpoint sin API_KEY (debe fallar)
curl http://localhost:3000/api/v1/users

# Respuesta esperada:
# {"msg":"Error","error":"API_KEY requerida..."}

# 4. Probar con API_KEY (debe funcionar)
curl -H "X-API-KEY: flixfinder_api_key_2024_grupo3_pps" \
     http://localhost:3000/api/v1/users
```

---

## 🧪 PRUEBAS FUNCIONALES

### Test 1: Crear Usuario

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "X-API-KEY: flixfinder_api_key_2024_grupo3_pps" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test",
    "apellido": "Usuario",
    "email": "test@flixfinder.com",
    "telefono": "1234567890"
  }'
```

### Test 2: Guardar Película

```bash
curl -X POST http://localhost:3000/api/v1/peliculas/db \
  -H "X-API-KEY: flixfinder_api_key_2024_grupo3_pps" \
  -H "Content-Type: application/json" \
  -d '{
    "tmdb_id": "550",
    "title": "El club de la lucha",
    "overview": "Un empleado de oficina...",
    "release_date": "1999-10-15",
    "vote_average": 8.4,
    "genre_ids": [18, 53]
  }'
```

### Test 3: Agregar a Favoritos

```bash
curl -X POST http://localhost:3000/api/v1/favorites \
  -H "X-API-KEY: flixfinder_api_key_2024_grupo3_pps" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "item_type": "movie",
    "item_id": 1
  }'
```

### Test 4: Ver Favoritos Detallados

```bash
curl -H "X-API-KEY: flixfinder_api_key_2024_grupo3_pps" \
     http://localhost:3000/api/v1/favorites/user/1/detailed
```

---

## 📱 ADAPTACIÓN DEL FRONTEND (Flutter)

### Cambios Necesarios en Flutter

#### 1. Actualizar `sample.env`

```env
RENDER_URL=localhost:3000/api/v1
API_KEY=flixfinder_api_key_2024_grupo3_pps
```

#### 2. Crear Servicio HTTP Base

Crear `lib/services/api_service.dart`:

```dart
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';

class ApiService {
  static final String baseUrl = 'http://${dotenv.env['RENDER_URL']}';
  static final String apiKey = dotenv.env['API_KEY'] ?? '';

  static Map<String, String> get headers => {
    'Content-Type': 'application/json',
    'X-API-KEY': apiKey,
  };

  static Future<http.Response> get(String endpoint) {
    return http.get(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
    );
  }

  static Future<http.Response> post(String endpoint, dynamic body) {
    return http.post(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
      body: jsonEncode(body),
    );
  }

  static Future<http.Response> put(String endpoint, dynamic body) {
    return http.put(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
      body: jsonEncode(body),
    );
  }

  static Future<http.Response> delete(String endpoint) {
    return http.delete(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
    );
  }
}
```

#### 3. Actualizar Servicios Existentes

Por ejemplo, en `lib/services/actor_service.dart`:

```dart
import 'api_service.dart';

class ActorService {
  Future<List<Actor>> getPopularActors({int page = 1, int limit = 50}) async {
    try {
      final response = await ApiService.get('/actores?page=$page&limit=$limit');
      
      if (response.statusCode == 200) {
        final Map<String, dynamic> jsonResponse = json.decode(response.body);
        return (jsonResponse['data'] as List)
            .map((actorJson) => Actor.fromJson(actorJson))
            .toList();
      }
      throw Exception('Error al cargar actores');
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }
}
```

---

## ✅ CHECKLIST DE ENTREGABLES PPS

### Backend
- [x] API con operaciones CRUD
- [x] Base de datos SQLite3
- [x] Diagrama Entidad-Relación
- [x] Protección con API_KEY en todas las rutas
- [x] README.md con documentación

### Frontend
- [ ] Actualizar servicios con API_KEY
- [ ] Crear .env con configuración
- [ ] README.md de instalación

### Documentación
- [x] Diagrama ER
- [x] Schema SQL
- [ ] Colección de Postman
- [ ] Screenshots de funcionalidad

### Despliegue
- [ ] Backend desplegado (Render)
- [ ] Frontend desplegado (opcional)

---

## 🎯 SIGUIENTES PASOS

### Inmediatos (1-2 horas)
1. Integrar archivos al proyecto backend
2. Probar endpoints con Postman
3. Verificar base de datos

### Corto plazo (2-4 horas)
1. Actualizar servicios Flutter
2. Probar integración frontend-backend
3. Crear colección Postman

### Antes de entregar (1-2 horas)
1. Generar documentación final
2. Crear video demo
3. Verificar todos los requerimientos

---

## 🆘 TROUBLESHOOTING

### Error: "Cannot find module 'sqlite3'"
```bash
npm install sqlite3
```

### Error: "API_KEY requerida"
Asegurarse de incluir el header en todas las peticiones:
```javascript
headers: { 'X-API-KEY': 'flixfinder_api_key_2024_grupo3_pps' }
```

### Error: "Database locked"
La base de datos SQLite solo permite una escritura a la vez. Cerrar conexiones correctamente.

### La base de datos no se crea
Verificar permisos de escritura en la carpeta `/database`

---

## 📞 CONTACTO

Para cualquier duda sobre la implementación, revisar:
1. Este archivo (GUIA_IMPLEMENTACION.md)
2. README_BACKEND.md
3. Comentarios en el código

---

**Última actualización:** Diciembre 2024  
**Versión:** 2.0.0