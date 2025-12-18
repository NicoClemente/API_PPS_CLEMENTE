# 🎬 FlixFinder API – Proyecto PPS

**Autor:** Nicolás Clemente
**Institución:** UTN – FRBB
**Proyecto:** Prácticas Profesionales Supervisadas (PPS)

---

## 📌 Descripción General

FlixFinder es una **API REST** desarrollada con **Node.js y Express** que permite a los usuarios:

* Registrarse y autenticarse mediante **JWT**
* Buscar **películas, series y actores** usando la API de **TMDb**
* Guardar **favoritos** (películas, series o actores)
* Crear **reviews y ratings** de películas y series

La API utiliza **PostgreSQL** como base de datos (hosteada en **Neon**) y aplica buenas prácticas de seguridad, validación y estructura REST.

---

## 🧱 Tecnologías Utilizadas

* Node.js
* Express.js
* PostgreSQL (Neon)
* JWT (JSON Web Token)
* bcrypt
* TMDb API
* Render (deploy backend)
* Vercel (deploy frontend)

---

## 🌐 Deploy

* **API (Render):**
  [https://api-pps-clementee.onrender.com/](https://api-pps-clementee.onrender.com/)

* **Frontend (Vercel):**
  [https://frontend-pps-clemente.vercel.app/](https://frontend-pps-clemente.vercel.app/)

* **Repositorio API:**
  [https://github.com/NicoClemente/API_PPS_CLEMENTE](https://github.com/NicoClemente/API_PPS_CLEMENTE)

* **Repositorio Frontend:**
  [https://github.com/NicoClemente/FRONTEND_PPS_CLEMENTE](https://github.com/NicoClemente/FRONTEND_PPS_CLEMENTE)

---

## 🔐 Autenticación y Seguridad

La API utiliza dos mecanismos:

### 🔑 API KEY

Requerida para rutas públicas de búsqueda:

```
x-api-key: TU_API_KEY
```

### 🔒 JWT

Requerido para rutas protegidas (favoritos, reviews, perfil):

```
Authorization: Bearer <token>
```

---

## 👤 Usuario de Prueba

```
Email: prueba123@prueba.com
Password: Prueba123
```

---

## 📍 Endpoints

### 🏠 Generales

| Método | Ruta      | Descripción         |
| ------ | --------- | ------------------- |
| GET    | `/`       | Información general |
| GET    | `/health` | Estado de la API    |

---

### 🔑 Autenticación

#### Registrar usuario

```
POST /auth/register
```

```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@email.com",
  "password": "Password123"
}
```

#### Login

```
POST /auth/login
```

```json
{
  "email": "prueba123@prueba.com",
  "password": "Prueba123"
}
```

#### Perfil (JWT)

```
GET /auth/profile
```

#### Cambiar contraseña (JWT)

```
PUT /auth/change-password
```

```json
{
  "currentPassword": "demo123",
  "newPassword": "NuevaPassword123"
}
```

---

## 🎥 Películas (TMDb)

```
GET /api/v1/peliculas/popular
GET /api/v1/peliculas/search?query=batman
GET /api/v1/peliculas/:id
```

---

## 📺 Series (TMDb)

```
GET /api/v1/series/popular
GET /api/v1/series/search?query=breaking
GET /api/v1/series/:id
```

---

## 🎭 Actores (TMDb)

```
GET /api/v1/actores/popular
GET /api/v1/actores/search?query=brad
GET /api/v1/actores/:id
```

---

## ⭐ Favoritos (JWT)

#### Obtener favoritos del usuario

```
GET /api/v1/favorites
```

#### Agregar / quitar favorito (toggle)

```
POST /api/v1/favorites/toggle
```

```json
{
  "item_type": "movie",
  "item_id": "550",
  "tmdb_id": "550"
}
```

#### Verificar si es favorito

```
GET /api/v1/favorites/check?item_type=movie&item_id=550
```

---

## ✍️ Reviews (JWT)

#### Crear o actualizar review

```
POST /api/v1/reviews
```

```json
{
  "item_type": "movie",
  "item_id": "550",
  "tmdb_id": "550",
  "rating": 9,
  "review_text": "Excelente película"
}
```

#### Obtener review del usuario para un item

```
GET /api/v1/reviews/single?item_type=movie&item_id=550
```

#### Obtener reviews de un item

```
GET /api/v1/reviews/item?item_type=movie&item_id=550
```

---

## 🗄️ Base de Datos

* PostgreSQL
* Host: Neon
* Esquema normalizado
* Triggers automáticos para `updated_at`

Tablas principales:

* users
* movies
* series
* actors
* favorites
* reviews

---

## 📊 Diagrama Entidad-Relación

Incluido en la entrega del proyecto (DER).

---

## 📦 Colección Postman

Se incluye una colección Postman con:

* Variables de entorno
* JWT automático
* Ejemplos de requests

---

## ✅ Estado del Proyecto

✔️ Funcional
✔️ Documentado
✔️ Deployado
✔️ Cumple requerimientos PPS

---

## 🧑‍🎓 Observaciones Académicas

Este proyecto demuestra:

* Consumo de APIs externas
* Autenticación segura
* Diseño REST
* Persistencia de datos
* Separación frontend / backend

---

**Gracias por revisar el proyecto.**
