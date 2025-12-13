const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ruta de la base de datos
const DB_PATH = path.join(__dirname, '../../database/flixfinder.db');

// Asegurar que el directorio existe
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Crear conexión a la base de datos
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err.message);
  } else {
    console.log('✅ Conectado a la base de datos SQLite');
    initializeDatabase();
  }
});

// Habilitar foreign keys
db.run('PRAGMA foreign_keys = ON');

/**
 * Inicializa la base de datos con el schema
 */
function initializeDatabase() {
  const schemaPath = path.join(__dirname, '../../database/schema.sql');
  
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    db.exec(schema, (err) => {
      if (err) {
        console.error('Error al inicializar la base de datos:', err.message);
      } else {
        console.log('✅ Schema de base de datos cargado correctamente');
      }
    });
  } else {
    console.warn('⚠️  Archivo schema.sql no encontrado');
  }
}

/**
 * Ejecuta una consulta con promesas
 * @param {string} sql - Query SQL
 * @param {array} params - Parámetros
 */
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

/**
 * Obtiene un registro
 * @param {string} sql - Query SQL
 * @param {array} params - Parámetros
 */
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

/**
 * Obtiene todos los registros
 * @param {string} sql - Query SQL
 * @param {array} params - Parámetros
 */
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

/**
 * Cierra la conexión con la base de datos
 */
function close() {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        reject(err);
      } else {
        console.log('✅ Conexión a la base de datos cerrada');
        resolve();
      }
    });
  });
}

module.exports = {
  db,
  run,
  get,
  all,
  close
};