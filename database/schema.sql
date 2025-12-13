-- ============================================
-- SCHEMA DE BASE DE DATOS - FlixFinder
-- SQLite3 Database Schema
-- ============================================

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Películas
CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tmdb_id VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    overview TEXT,
    release_date VARCHAR(20),
    vote_average REAL DEFAULT 0,
    poster_path VARCHAR(255),
    genre_ids TEXT,  -- JSON array almacenado como texto
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Series
CREATE TABLE IF NOT EXISTS series (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tvmaze_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    summary TEXT,
    premiered VARCHAR(20),
    status VARCHAR(50),
    genres TEXT,  -- JSON array almacenado como texto
    network VARCHAR(100),
    image_url VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Actores
CREATE TABLE IF NOT EXISTS actors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tmdb_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    popularity REAL DEFAULT 0,
    known_for TEXT,  -- JSON array almacenado como texto
    profile_path VARCHAR(255),
    biography TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Favoritos (Polimórfica)
CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    item_type VARCHAR(20) NOT NULL CHECK(item_type IN ('movie', 'series', 'actor')),
    item_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, item_type, item_id)
);

-- ============================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- ============================================

-- Índices en Favoritos
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_item ON favorites(item_type, item_id);

-- Índices únicos para IDs externos
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_movies_tmdb ON movies(tmdb_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_series_tvmaze ON series(tvmaze_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_actors_tmdb ON actors(tmdb_id);

-- ============================================
-- TRIGGERS PARA UPDATED_AT
-- ============================================

-- Trigger para Users
CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger para Movies
CREATE TRIGGER IF NOT EXISTS update_movies_timestamp 
AFTER UPDATE ON movies
BEGIN
    UPDATE movies SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger para Series
CREATE TRIGGER IF NOT EXISTS update_series_timestamp 
AFTER UPDATE ON series
BEGIN
    UPDATE series SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger para Actors
CREATE TRIGGER IF NOT EXISTS update_actors_timestamp 
AFTER UPDATE ON actors
BEGIN
    UPDATE actors SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ============================================
-- DATOS DE PRUEBA (OPCIONAL)
-- ============================================

-- Usuario de prueba
INSERT OR IGNORE INTO users (nombre, apellido, email, telefono) 
VALUES ('Usuario', 'Demo', 'demo@flixfinder.com', '1234567890');
