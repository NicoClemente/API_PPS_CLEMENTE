# 🎬 FlixFinder API - Backend

## Proyecto Final de Práctica Profesional Supervisada (PPS)
**Universidad Tecnológica Nacional - FRBB**  
**Materia:** Laboratorio IV  
**Profesor:** Sebastián Gañan  
**Alumno**: Nicolás Clemente

---

## 📋 Descripción

API REST desarrollada con Node.js y Express que gestiona películas, series, actores, usuarios, favoritos y reseñas. El sistema implementa:

- ✅ Base de datos PostgreSQL en Neon (nube) para persistencia
- ✅ Operaciones CRUD completas para usuarios, favoritos y reseñas
- ✅ Protección con API_KEY en todas las rutas `/api`
- ✅ Autenticación JWT para usuarios registrados
- ✅ Integración con APIs externas (TMDb para películas, series y actores)
- ✅ Sistema de favoritos y reseñas
- ✅ Gestión completa de usuarios con hashing de contraseñas (bcrypt)
- ✅ CORS habilitado para frontend (Flutter Web)

---

## 🚀 Instalación

### Requisitos previos
- Node.js v16 o superior
- npm o yarn
- Cuenta en [Neon](https://neon.tech) para base de datos PostgreSQL

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone [URL_DEL_REPO_BACKEND]
cd API_PPS_CLEMENTE
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar base de datos en Neon**
   - Crear una cuenta en Neon
   - Crear un nuevo proyecto de base de datos
   - Copiar la `DATABASE_URL` proporcionada

4. **Configurar variables de entorno**
```bash
cp sample.env .env
```

Editar el archivo `.env` con tus credenciales:
```env
PORT=3000
DATABASE_URL=postgresql://tu_usuario:tu_password@tu_host/tu_base_datos?sslmode=require
API_KEY=tu_api_key_segura_aqui
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
TMDB_ACCESS_TOKEN=tu_token_de_tmdb_aqui
```

5. **Crear las tablas en la base de datos**
```bash
# Ejecutar el schema en Neon (usando pgAdmin, DBeaver o psql)
# Archivo: database/schema_postgresql.sql
```

6. **Iniciar el servidor**
```bash
# Modo desarrollo
npm run dev

# Modo producción
npm start
```

La API estará disponible en `http://localhost:3000`

---

## 🔐 Autenticación

### API_KEY (Obligatoria para todas las rutas `/api`)
**TODAS** las rutas protegidas requieren autenticación mediante API_KEY.

**Métodos de envío:**

**Opción 1: Header (Recomendado)**
```bash
curl -H "X-API-KEY: {{api_key}}" http://localhost:3000/api/v1/peliculas
```

**Opción 2: Query Parameter**
```bash
curl "http://localhost:3000/api/v1/peliculas?api_key={{api_key}}"
```

### JWT (Para usuarios registrados)
Algunas rutas requieren autenticación de usuario además de API_KEY.

**Obtener JWT:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@flixfinder.com","password":"demo123"}'
```

**Usar JWT:**
```bash
curl -H "X-API-KEY: {{api_key}}" \
     -H "Authorization: Bearer TU_JWT_TOKEN" \
     http://localhost:3000/api/v1/favorites
```

---

## 📚 Endpoints

### 🔓 Rutas Públicas

#### Información de la API
```http
GET /
```

#### Health Check
```http
GET /health
```

### 🔐 Autenticación (sin API_KEY)

#### Registrar usuario
```http
POST /auth/register
Content-Type: application/json

{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@email.com",
  "password": "password123",
  "telefono": "1234567890"
}
```

#### Iniciar sesión
```http
POST /auth/login
Content-Type: application/json

{
  "email": "juan@email.com",
  "password": "password123"
}
```

#### Obtener perfil (requiere JWT)
```http
GET /auth/profile
Authorization: Bearer <token>
```

#### Actualizar perfil (requiere JWT)
```http
PUT /auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre": "Juan Carlos",
  "telefono": "9876543210"
}
```

### 🎬 Películas (requiere API_KEY)

#### Obtener películas populares (TMDb)
```http
GET /api/v1/peliculas
```

#### Buscar películas por título
```http
GET /api/v1/peliculas/buscar?query=matrix
```

#### Filtrar por género
```http
GET /api/v1/peliculas/generos?genre=28
```

#### Obtener lista de géneros
```http
GET /api/v1/peliculas/generos
```

#### Obtener película por ID de TMDb
```http
GET /api/v1/peliculas/:id
```

### 📺 Series (requiere API_KEY)

#### Obtener series populares (TMDb)
```http
GET /api/v1/series?page=1
```

#### Buscar series por nombre
```http
GET /api/v1/series/buscar?query=breaking+bad
```

#### Filtrar por género
```http
GET /api/v1/series/genero?genre=18
```

#### Obtener serie por ID de TMDb
```http
GET /api/v1/series/:id
```

### 👤 Actores (requiere API_KEY)

#### Obtener actores populares (TMDb)
```http
GET /api/v1/actores?page=1&limit=50
```

#### Buscar actores por nombre
```http
GET /api/v1/actores/name?nombre=DiCaprio
```

#### Obtener actor por ID de TMDb
```http
GET /api/v1/actores/:id
```

### 👥 Usuarios (requiere API_KEY)

#### Crear usuario
```http
POST /api/v1/users
Content-Type: application/json

{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@email.com",
  "password": "password123",
  "telefono": "1234567890"
}
```

#### Obtener todos los usuarios (paginado)
```http
GET /api/v1/users?page=1&limit=20
```

#### Obtener usuario por ID
```http
GET /api/v1/users/:id
```

#### Actualizar usuario
```http
PUT /api/v1/users/:id
Content-Type: application/json

{
  "nombre": "Juan Carlos",
  "telefono": "9876543210"
}
```

#### Eliminar usuario
```http
DELETE /api/v1/users/:id
```

### ⭐ Favoritos (requiere API_KEY + JWT)

#### Agregar a favoritos
```http
POST /api/v1/favorites
Authorization: Bearer <token>
Content-Type: application/json

{
  "item_type": "movie",
  "item_id": "550"
}
```
**item_type:** `movie`, `series` o `actor`

#### Obtener favoritos del usuario autenticado
```http
GET /api/v1/favorites
Authorization: Bearer <token>
```

#### Obtener favoritos con detalles
```http
GET /api/v1/favorites/detailed
Authorization: Bearer <token>
```

#### Filtrar favoritos por tipo
```http
GET /api/v1/favorites?type=movie
Authorization: Bearer <token>
```

#### Eliminar favorito por ID
```http
DELETE /api/v1/favorites/:id
Authorization: Bearer <token>
```

### 📝 Reseñas (requiere API_KEY + JWT)

#### Crear reseña
```http
POST /api/v1/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "item_type": "movie",
  "item_id": "550",
  "rating": 9,
  "review_text": "Excelente película",
  "is_favorite": true
}
```

#### Obtener reseñas del usuario
```http
GET /api/v1/reviews
Authorization: Bearer <token>
```

#### Obtener reseñas con detalles
```http
GET /api/v1/reviews/detailed
Authorization: Bearer <token>
```

#### Actualizar reseña
```http
PUT /api/v1/reviews/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 10,
  "review_text": "Obra maestra"
}
```

#### Eliminar reseña
```http
DELETE /api/v1/reviews/:id
Authorization: Bearer <token>
```

---

## 🗄️ Base de Datos

### PostgreSQL en Neon

La aplicación utiliza PostgreSQL alojado en Neon (https://neon.tech), un servicio de base de datos en la nube.

### Estructura de Tablas

- **users** - Usuarios registrados con contraseñas hasheadas
- **movies** - Cache de películas de TMDb
- **series** - Cache de series de TMDb
- **actors** - Cache de actores de TMDb
- **favorites** - Favoritos de usuarios (relación polimórfica)
- **reviews** - Reseñas y calificaciones de usuarios

### Diagrama ER

Ver archivo `docs/DIAGRAMA_ER.md` para el diagrama completo.

### Schema SQL

El schema se encuentra en `database/schema_postgresql.sql`. Ejecutarlo en Neon para crear las tablas.

**Usuario de prueba incluido:**
- Email: `prueba123@prueba.com`
- Password: `Prueba123`

---

## 📁 Estructura del Proyecto

```
API_PPS_CLEMENTE/
├── src/
│   ├── config/
│   │   └── database.js          # Configuración PostgreSQL (Neon)
│   ├── controllers/
│   │   ├── actors.js            # Controladores de actores
│   │   ├── authController.js    # Autenticación JWT
│   │   ├── books.js             # Libros (OpenLibrary)
│   │   ├── favoritesController.js # Favoritos
│   │   ├── movies.js            # Películas (TMDb)
│   │   ├── reviewsController.js # Reseñas
│   │   ├── series.js            # Series (TMDb)
│   │   └── users.js             # Usuarios
│   ├── middleware/
│   │   └── auth.js              # Middleware API_KEY y JWT
│   ├── models/
│   │   └── server.js            # Clase Server principal
│   └── routes/
│       ├── actors.js
│       ├── authRoutes.js        # Rutas de autenticación
│       ├── books.js
│       ├── favorites.js
│       ├── movies.js
│       ├── reviews.js
│       ├── series.js
│       └── users.js
├── database/
│   └── schema_postgresql.sql    # Schema de PostgreSQL
├── docs/
│   └── DIAGRAMA_ER.md           # Diagrama Entidad-Relación
├── public/
│   └── index.html               # Página de bienvenida
├── .env                         # Variables de entorno (no commitear)
├── sample.env                   # Ejemplo de .env
├── .gitignore
├── app.js                       # Punto de entrada
├── package.json
├── readme.MD                    # Este archivo
```

---

## 🧪 Pruebas con Postman

### Importar Colección

1. Abrir Postman
2. Crear una nueva colección llamada "FlixFinder API"
3. Configurar las variables de entorno

### Variables de Entorno en Postman

Crear un entorno con:
- `base_url`: `http://localhost:3000`
- `api_key`: `tu_api_key_segura_aqui`
- `jwt_token`: (obtenerlo del login)

### Ejemplos de Requests

#### Login y obtener JWT
```http
POST {{base_url}}/auth/login
Content-Type: application/json

{
  "email": "demo@flixfinder.com",
  "password": "demo123"
}
```

#### Obtener películas con API_KEY
```http
GET {{base_url}}/api/v1/peliculas
X-API-KEY: {{api_key}}
```

#### Agregar favorito (requiere JWT)
```http
POST {{base_url}}/api/v1/favorites
X-API-KEY: {{api_key}}
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "item_type": "movie",
  "item_id": "550"
}
```

---

## 🚀 Despliegue

### Opciones de Despliegue

La API puede desplegarse en plataformas como:
- **Render** (recomendado para APIs)
- **Vercel**
- **Heroku**
- **Railway**

### Variables de Entorno en Producción

Asegurarse de configurar en la plataforma:
- `DATABASE_URL` (de Neon)
- `API_KEY` (generar una nueva segura)
- `JWT_SECRET` (generar uno seguro)
- `TMDB_ACCESS_TOKEN`
- `NODE_ENV=production`

### Comandos para Despliegue

```bash
# Instalar dependencias
npm install --production

# Iniciar en producción
npm start
```

---

## 🛠️ Tecnologías Utilizadas

- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **PostgreSQL** - Base de datos relacional
- **Neon** - Servicio de BD en la nube
- **pg** - Cliente PostgreSQL para Node.js
- **bcryptjs** - Hashing de contraseñas
- **jsonwebtoken** - Autenticación JWT
- **axios** - Cliente HTTP para APIs externas
- **cors** - Control de acceso CORS
- **dotenv** - Variables de entorno

---

## 📝 Notas Importantes

### Seguridad
- **API_KEY**: Protege todas las rutas `/api`. Cambiar en producción.
- **JWT**: Para autenticación de usuarios. Expira en 24 horas.
- **Contraseñas**: Hasheadas con bcrypt (10 rounds).
- **CORS**: Configurado para Flutter Web.

### Base de Datos
- **Neon**: PostgreSQL serverless. Gratuito hasta ciertos límites.
- **Pool de conexiones**: Máximo 20 conexiones.
- **Triggers**: Actualizan `updated_at` automáticamente.
- **Índices**: Optimizados para búsquedas.

### APIs Externas
- **TMDb**: Requiere Access Token (gratuito).
- **Rate limiting**: Respetar límites de TMDb.

### Errores Comunes
- **DATABASE_URL**: Verificar SSL mode.
- **API_KEY**: Incluir en headers o query.
- **JWT**: Verificar expiración.

---

## 👥 Desarrollador

- **Nicolás Clemente** - 
---

## 📄 Licencia

Proyecto académico - UTN FRBB 2024

---

## 📞 Soporte

Para consultas sobre el proyecto, contactar al profesor Sebastián Gañan o al equipo de desarrollo.