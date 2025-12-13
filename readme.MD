# 🎬 FlixFinder API - Backend

## Proyecto Final de Práctica Profesional Supervisada (PPS)
**Universidad Tecnológica Nacional - FRBB**  
**Materia:** Laboratorio IV  
**Profesor:** Sebastián Gañan  
**Grupo 3:** Racciatti Carla, Mattei Stefano, Clemente Nicolás

---

## 📋 Descripción

API REST desarrollada con Node.js y Express que gestiona películas, series, actores y usuarios. El sistema implementa:

- ✅ Base de datos SQLite3 para persistencia
- ✅ Operaciones CRUD completas
- ✅ Protección con API_KEY en todas las rutas
- ✅ Integración con APIs externas (TMDb, TVMaze, OpenLibrary)
- ✅ Sistema de favoritos
- ✅ Gestión de usuarios

---

## 🚀 Instalación

### Requisitos previos
- Node.js v16 o superior
- npm o yarn

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone [URL_DEL_REPO]
cd backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Editar el archivo `.env` con tus credenciales:
```env
PORT=3000
API_KEY=flixfinder_api_key_2024_grupo3_pps
TMDB_ACCESS_TOKEN=tu_token_aqui
```

4. **Iniciar el servidor**
```bash
# Modo desarrollo
npm run dev

# Modo producción
npm start
```

La API estará disponible en `http://localhost:3000`

---

## 🔐 Autenticación

**TODAS** las rutas `/api` requieren autenticación mediante API_KEY.

### Métodos de envío:

**Opción 1: Header (Recomendado)**
```bash
curl -H "X-API-KEY: flixfinder_api_key_2024_grupo3_pps" http://localhost:3000/api/v1/peliculas
```

**Opción 2: Query Parameter**
```bash
curl http://localhost:3000/api/v1/peliculas?api_key=flixfinder_api_key_2024_grupo3_pps
```

---

## 📚 Endpoints

### 🎬 Películas

#### Obtener películas populares (TMDb)
```http
GET /api/v1/peliculas
```

#### Buscar película por título
```http
GET /api/v1/peliculas/buscar?query=matrix
```

#### Filtrar por género
```http
GET /api/v1/peliculas/generos?genre=accion
```

#### Obtener lista de géneros
```http
GET /api/v1/peliculas/generos
```

#### Obtener película por ID de TMDb
```http
GET /api/v1/peliculas/:id
```

#### **CRUD - Base de Datos Local**

##### Crear película
```http
POST /api/v1/peliculas/db
Content-Type: application/json

{
  "tmdb_id": "550",
  "title": "El club de la lucha",
  "overview": "Un empleado de oficina...",
  "release_date": "1999-10-15",
  "vote_average": 8.4,
  "poster_path": "/path/to/poster.jpg",
  "genre_ids": [18, 53]
}
```

##### Obtener películas guardadas
```http
GET /api/v1/peliculas/db?page=1&limit=20
```

##### Obtener película por ID local
```http
GET /api/v1/peliculas/db/:id
```

##### Actualizar película
```http
PUT /api/v1/peliculas/db/:id
Content-Type: application/json

{
  "title": "Fight Club",
  "vote_average": 8.5
}
```

##### Eliminar película
```http
DELETE /api/v1/peliculas/db/:id
```

---

### 📺 Series

#### Obtener series (TVMaze)
```http
GET /api/v1/series?page=1
```

#### Buscar series
```http
GET /api/v1/series/buscar?query=breaking+bad
```

#### Filtrar por género
```http
GET /api/v1/series/genero?genre=drama
```

#### Obtener serie por ID de TVMaze
```http
GET /api/v1/series/:id
```

---

### 👤 Actores

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

---

### 👥 Usuarios

#### Crear usuario
```http
POST /api/v1/users
Content-Type: application/json

{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@email.com",
  "telefono": "1234567890"
}
```

#### Obtener todos los usuarios
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

---

### ⭐ Favoritos

#### Agregar a favoritos
```http
POST /api/v1/favorites
Content-Type: application/json

{
  "user_id": 1,
  "item_type": "movie",
  "item_id": 5
}
```
**item_type:** `movie`, `series` o `actor`

#### Obtener favoritos de un usuario
```http
GET /api/v1/favorites/user/:user_id
```

#### Obtener favoritos con detalles
```http
GET /api/v1/favorites/user/:user_id/detailed
```

#### Filtrar favoritos por tipo
```http
GET /api/v1/favorites/user/:user_id?type=movie
```

#### Eliminar favorito por ID
```http
DELETE /api/v1/favorites/:id
```

#### Eliminar favorito específico
```http
DELETE /api/v1/favorites/remove
Content-Type: application/json

{
  "user_id": 1,
  "item_type": "movie",
  "item_id": 5
}
```

---

## 🗄️ Base de Datos

### Estructura

La base de datos SQLite3 incluye las siguientes tablas:

- **users** - Usuarios de la aplicación
- **movies** - Películas guardadas
- **series** - Series guardadas
- **actors** - Actores guardados
- **favorites** - Favoritos de usuarios (relación polimórfica)

### Diagrama ER

Ver archivo `docs/DIAGRAMA_ER.md` para el diagrama completo.

### Schema SQL

El schema se encuentra en `database/schema.sql` y se carga automáticamente al iniciar la aplicación.

---

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Configuración SQLite
│   ├── controllers/
│   │   ├── movies_crud.js       # CRUD películas
│   │   ├── series.js            # Series
│   │   ├── actors.js            # Actores
│   │   ├── users.js             # Usuarios
│   │   └── favorites.js         # Favoritos
│   ├── middlewares/
│   │   └── auth.js              # Middleware API_KEY
│   ├── models/
│   │   └── server.js            # Clase Server
│   └── routes/
│       ├── movies.js
│       ├── series.js
│       ├── actors.js
│       ├── users.js
│       └── favorites.js
├── database/
│   ├── schema.sql               # Schema de la BD
│   └── flixfinder.db            # Base de datos (se crea automáticamente)
├── docs/
│   └── DIAGRAMA_ER.md           # Diagrama Entidad-Relación
├── public/
│   └── index.html
├── .env.example                 # Ejemplo de variables de entorno
├── .gitignore
├── app.js                       # Punto de entrada
├── package.json
└── README.md
```

---

## 🧪 Pruebas con Postman

### Importar Colección

1. Abrir Postman
2. Importar la colección desde `postman/FlixFinder_API.postman_collection.json`
3. Configurar la variable de entorno `API_KEY`

### Variables de Entorno

Crear un entorno en Postman con:
- `base_url`: `http://localhost:3000`
- `api_key`: `flixfinder_api_key_2024_grupo3_pps`

---

## 🛠️ Tecnologías Utilizadas

- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **SQLite3** - Base de datos
- **Axios** - Cliente HTTP
- **CORS** - Control de acceso
- **dotenv** - Variables de entorno

---

## 📝 Notas Importantes

### Sobre la API_KEY

- La API_KEY protege **TODAS** las rutas `/api`
- En producción, cambiar por una clave más segura
- Nunca commitear el archivo `.env` al repositorio

### Sobre la Base de Datos

- La base de datos se crea automáticamente en el primer inicio
- El archivo `flixfinder.db` se encuentra en `/database`
- Para resetear la BD, simplemente eliminar el archivo `.db`

### Sobre las APIs Externas

- **TMDb** requiere Access Token en `.env`
- **TVMaze** no requiere autenticación
- **OpenLibrary** no requiere autenticación

---

## 👥 Equipo de Desarrollo

- **Carla Racciatti** - Actores y Libros
- **Stefano Mattei** - Series
- **Nicolás Clemente** - Películas

---

## 📄 Licencia

Proyecto académico - UTN FRBB 2024

---

## 📞 Soporte

Para consultas sobre el proyecto, contactar al profesor Sebastián Gañan.