const pool = require('../config/database');

/**
 * Agregar a favoritos
 * POST /api/v1/favorites
 * Requiere: JWT token
 * Body: { item_type, item_id, tmdb_id }
 */
exports.addFavorite = async (req, res) => {
    try {
        const userId = req.user.id; // Del token JWT
        const { item_type, item_id, tmdb_id } = req.body;

        // ============================================
        // VALIDACIONES
        // ============================================
        if (!item_type || !item_id) {
            return res.status(400).json({
                success: false,
                msg: 'item_type e item_id son obligatorios'
            });
        }

        if (!['movie', 'series', 'actor'].includes(item_type)) {
            return res.status(400).json({
                success: false,
                msg: 'item_type debe ser: movie, series o actor'
            });
        }

        // ============================================
        // INSERTAR FAVORITO
        // ============================================
        // ON CONFLICT: Si ya existe, no hace nada (previene duplicados)
        const result = await pool.query(
            `INSERT INTO favorites (user_id, item_type, item_id, tmdb_id)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (user_id, item_type, item_id) DO NOTHING
             RETURNING *`,
            [userId, item_type, item_id, tmdb_id]
        );

        if (result.rows.length === 0) {
            // Ya existía en favoritos
            return res.status(200).json({
                success: true,
                msg: 'Ya estaba en favoritos',
                alreadyExists: true
            });
        }

        console.log(`✅ Favorito agregado: User ${userId} - ${item_type} ${item_id}`);

        res.status(201).json({
            success: true,
            msg: 'Agregado a favoritos',
            favorite: result.rows[0]
        });

    } catch (error) {
        console.error('❌ Error al agregar favorito:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al agregar favorito',
            error: error.message
        });
    }
};

/**
 * Obtener favoritos del usuario
 * GET /api/v1/favorites
 * Query params: ?type=movie (opcional, filtra por tipo)
 * Requiere: JWT token
 */
exports.getUserFavorites = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type } = req.query; // Filtrar por tipo (opcional)

        let query = 'SELECT * FROM favorites WHERE user_id = $1';
        const params = [userId];

        // Filtrar por tipo si se proporciona
        if (type && ['movie', 'series', 'actor'].includes(type)) {
            query += ' AND item_type = $2';
            params.push(type);
        }

        query += ' ORDER BY created_at DESC';

        const result = await pool.query(query, params);

        console.log(`✅ Favoritos obtenidos: User ${userId} - ${result.rows.length} items`);

        res.json({
            success: true,
            count: result.rows.length,
            favorites: result.rows
        });

    } catch (error) {
        console.error('❌ Error al obtener favoritos:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al obtener favoritos',
            error: error.message
        });
    }
};

/**
 * Obtener favoritos con detalles completos
 * GET /api/v1/favorites/detailed
 * Requiere: JWT token
 * 
 * Retorna favoritos con toda la información de películas/series/actores
 */
exports.getUserFavoritesDetailed = async (req, res) => {
    try {
        const userId = req.user.id;

        // Obtener todos los favoritos del usuario
        const favoritesResult = await pool.query(
            'SELECT * FROM favorites WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );

        const favorites = favoritesResult.rows;
        const detailedFavorites = [];

        // Para cada favorito, obtener los detalles según el tipo
        for (const fav of favorites) {
            let details = null;
            
            try {
                if (fav.item_type === 'movie') {
                    const movieResult = await pool.query(
                        'SELECT * FROM movies WHERE tmdb_id = $1',
                        [fav.tmdb_id || fav.item_id]
                    );
                    details = movieResult.rows[0] || null;
                } else if (fav.item_type === 'series') {
                    const seriesResult = await pool.query(
                        'SELECT * FROM series WHERE tmdb_id = $1',
                        [fav.tmdb_id || fav.item_id]
                    );
                    details = seriesResult.rows[0] || null;
                } else if (fav.item_type === 'actor') {
                    const actorResult = await pool.query(
                        'SELECT * FROM actors WHERE tmdb_id = $1',
                        [fav.tmdb_id || fav.item_id]
                    );
                    details = actorResult.rows[0] || null;
                }
            } catch (detailError) {
                console.error(`Error obteniendo detalles de ${fav.item_type} ${fav.item_id}:`, detailError);
            }

            detailedFavorites.push({
                ...fav,
                details
            });
        }

        console.log(`✅ Favoritos detallados obtenidos: User ${userId} - ${detailedFavorites.length} items`);

        res.json({
            success: true,
            count: detailedFavorites.length,
            favorites: detailedFavorites
        });

    } catch (error) {
        console.error('❌ Error al obtener favoritos detallados:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al obtener favoritos detallados',
            error: error.message
        });
    }
};

/**
 * Eliminar de favoritos
 * DELETE /api/v1/favorites
 * Body: { item_type, item_id }
 * Requiere: JWT token
 */
exports.removeFavorite = async (req, res) => {
    try {
        const userId = req.user.id;
        const { item_type, item_id } = req.body;

        // Validaciones
        if (!item_type || !item_id) {
            return res.status(400).json({
                success: false,
                msg: 'item_type e item_id son obligatorios'
            });
        }

        const result = await pool.query(
            `DELETE FROM favorites 
             WHERE user_id = $1 AND item_type = $2 AND item_id = $3
             RETURNING *`,
            [userId, item_type, item_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                msg: 'Favorito no encontrado'
            });
        }

        console.log(`✅ Favorito eliminado: User ${userId} - ${item_type} ${item_id}`);

        res.json({
            success: true,
            msg: 'Eliminado de favoritos'
        });

    } catch (error) {
        console.error('❌ Error al eliminar favorito:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al eliminar favorito',
            error: error.message
        });
    }
};

/**
 * Verificar si un item está en favoritos
 * GET /api/v1/favorites/check?item_type=movie&item_id=550
 * Requiere: JWT token
 */
exports.checkFavorite = async (req, res) => {
    try {
        const userId = req.user.id;
        const { item_type, item_id } = req.query;

        if (!item_type || !item_id) {
            return res.status(400).json({
                success: false,
                msg: 'item_type e item_id son obligatorios'
            });
        }

        const result = await pool.query(
            `SELECT * FROM favorites 
             WHERE user_id = $1 AND item_type = $2 AND item_id = $3`,
            [userId, item_type, item_id]
        );

        res.json({
            success: true,
            isFavorite: result.rows.length > 0,
            favorite: result.rows[0] || null
        });

    } catch (error) {
        console.error('❌ Error al verificar favorito:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al verificar favorito',
            error: error.message
        });
    }
};

/**
 * Toggle favorito (agregar si no existe, eliminar si existe)
 * POST /api/v1/favorites/toggle
 * Body: { item_type, item_id, tmdb_id }
 * Requiere: JWT token
 */
exports.toggleFavorite = async (req, res) => {
    try {
        const userId = req.user.id;
        const { item_type, item_id, tmdb_id } = req.body;

        // Verificar si existe
        const checkResult = await pool.query(
            'SELECT * FROM favorites WHERE user_id = $1 AND item_type = $2 AND item_id = $3',
            [userId, item_type, item_id]
        );

        if (checkResult.rows.length > 0) {
            // Ya existe, eliminar
            await pool.query(
                'DELETE FROM favorites WHERE user_id = $1 AND item_type = $2 AND item_id = $3',
                [userId, item_type, item_id]
            );
            
            console.log(`✅ Favorito eliminado (toggle): User ${userId} - ${item_type} ${item_id}`);
            
            return res.json({
                success: true,
                msg: 'Eliminado de favoritos',
                isFavorite: false
            });
        } else {
            // No existe, agregar
            await pool.query(
                'INSERT INTO favorites (user_id, item_type, item_id, tmdb_id) VALUES ($1, $2, $3, $4)',
                [userId, item_type, item_id, tmdb_id]
            );
            
            console.log(`✅ Favorito agregado (toggle): User ${userId} - ${item_type} ${item_id}`);
            
            return res.json({
                success: true,
                msg: 'Agregado a favoritos',
                isFavorite: true
            });
        }

    } catch (error) {
        console.error('❌ Error al toggle favorito:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al toggle favorito',
            error: error.message
        });
    }
};

/**
 * Obtener estadísticas de favoritos del usuario
 * GET /api/v1/favorites/stats
 * Requiere: JWT token
 */
exports.getFavoritesStats = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `SELECT 
                item_type,
                COUNT(*) as count
             FROM favorites 
             WHERE user_id = $1
             GROUP BY item_type`,
            [userId]
        );

        const stats = {
            total: 0,
            movies: 0,
            series: 0,
            actors: 0
        };

        result.rows.forEach(row => {
            stats.total += parseInt(row.count);
            if (row.item_type === 'movie') stats.movies = parseInt(row.count);
            if (row.item_type === 'series') stats.series = parseInt(row.count);
            if (row.item_type === 'actor') stats.actors = parseInt(row.count);
        });

        res.json({
            success: true,
            stats
        });

    } catch (error) {
        console.error('❌ Error al obtener stats de favoritos:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al obtener estadísticas',
            error: error.message
        });
    }
};