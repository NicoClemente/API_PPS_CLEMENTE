-- ============================================
-- SCHEMA POSTGRESQL - FlixFinder PPS
-- Nicolas Clemente - UTN FRBB
-- ============================================

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Películas (cache local de TMDb)
CREATE TABLE IF NOT EXISTS movies (
    id SERIAL PRIMARY KEY,
    tmdb_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    overview TEXT,
    release_date VARCHAR(20),
    vote_average DECIMAL(3,1),
    vote_count INTEGER,
    poster_path VARCHAR(500),
    backdrop_path VARCHAR(500),
    genre_ids JSONB,
    runtime INTEGER,
    original_language VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Series (cache local de TMDb)
CREATE TABLE IF NOT EXISTS series (
    id SERIAL PRIMARY KEY,
    tmdb_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(500) NOT NULL,
    overview TEXT,
    first_air_date VARCHAR(20),
    vote_average DECIMAL(3,1),
    vote_count INTEGER,
    poster_path VARCHAR(500),
    backdrop_path VARCHAR(500),
    genre_ids JSONB,
    number_of_seasons INTEGER,
    number_of_episodes INTEGER,
    original_language VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Actores (cache local de TMDb)
CREATE TABLE IF NOT EXISTS actors (
    id SERIAL PRIMARY KEY,
    tmdb_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    profile_path VARCHAR(500),
    biography TEXT,
    birthday VARCHAR(20),
    deathday VARCHAR(20),
    place_of_birth VARCHAR(255),
    known_for_department VARCHAR(100),
    popularity DECIMAL(8,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Favoritos
CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('movie', 'series', 'actor')),
    item_id VARCHAR(50) NOT NULL,
    tmdb_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, item_type, item_id)
);

-- Tabla de Reseñas
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('movie', 'series')),
    item_id VARCHAR(50) NOT NULL,
    tmdb_id VARCHAR(50),
    rating INTEGER CHECK (rating >= 1 AND rating <= 10),
    review_text TEXT,
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, item_type, item_id)
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_movies_tmdb_id ON movies(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_series_tmdb_id ON series(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_actors_tmdb_id ON actors(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_item ON favorites(item_type, item_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_item ON reviews(item_type, item_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_movies_updated_at ON movies;
CREATE TRIGGER update_movies_updated_at BEFORE UPDATE ON movies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_series_updated_at ON series;
CREATE TRIGGER update_series_updated_at BEFORE UPDATE ON series
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_actors_updated_at ON actors;
CREATE TRIGGER update_actors_updated_at BEFORE UPDATE ON actors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Datos de ejemplo (opcional)
-- Usuario de prueba: demo@flixfinder.com / password: demo123
-- Password hasheado con bcrypt (10 rounds)
INSERT INTO users (nombre, apellido, email, password, telefono) 
VALUES (
    'Usuario',
    'Demo',
    'demo@flixfinder.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    '1234567890'
) ON CONFLICT (email) DO NOTHING;

-- Verificar que todo se creó correctamente
DO $$
BEGIN
    RAISE NOTICE '✅ Schema cargado correctamente';
    RAISE NOTICE 'Tablas creadas: users, movies, series, actors, favorites, reviews';
    RAISE NOTICE 'Índices creados: 8 índices';
    RAISE NOTICE 'Triggers creados: 5 triggers';
    RAISE NOTICE 'Usuario demo creado: demo@flixfinder.com / demo123';
END $$;