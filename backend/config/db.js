const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Necesario para bases de datos en la nube como Neon
  },
});

// Probar la conexión al iniciar
pool.connect(async (err, client, release) => {
  if (err) {
    return console.error("Error conectando a PostgreSQL:", err.stack);
  }
  console.log("Conectado a la base de datos PostgreSQL exitosamente.");

  // Asegurar que exista la PYME 1 (por defecto) para evitar errores de Foreign Key
  try {
    await client.query(`
      INSERT INTO pymes (pyme_id, nombre_negocio, ruc, sector, estado) 
      VALUES (1, 'Mi Negocio AIaaS', '0000000000001', 'otro', 'activo')
      ON CONFLICT (pyme_id) DO NOTHING;
    `);
  } catch (seedErr) {
    console.error("Error inicializando PYME por defecto:", seedErr);
  }

  release();
});

module.exports = pool;
