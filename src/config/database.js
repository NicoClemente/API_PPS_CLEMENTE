const { Pool } = require('pg');

// Configuración del pool de conexiones a PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Necesario para Neon
    },
    max: 20, // Máximo número de conexiones en el pool
    idleTimeoutMillis: 30000, // Tiempo que una conexión puede estar idle
    connectionTimeoutMillis: 2000, // Timeout para establecer conexión
});

// Event listeners
pool.on('connect', () => {
    console.log('✅ Conectado a PostgreSQL (Neon)');
});

pool.on('error', (err) => {
    console.error('❌ Error inesperado en PostgreSQL:', err);
    process.exit(-1);
});

// Función helper para ejecutar queries con logging
pool.queryWithLog = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log(`🔍 Query ejecutado en ${duration}ms`);
        return res;
    } catch (error) {
        console.error('❌ Error en query:', error);
        throw error;
    }
};

// Test de conexión inicial
(async () => {
    try {
        const result = await pool.query('SELECT NOW()');
        console.log('🕐 Timestamp de PostgreSQL:', result.rows[0].now);
        
        // Verificar tablas
        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log(`📊 Tablas encontradas: ${tables.rows.map(t => t.table_name).join(', ')}`);
    } catch (error) {
        console.error('❌ Error al conectar con PostgreSQL:', error.message);
    }
})();

module.exports = pool;