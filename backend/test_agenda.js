require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }});

async function run() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const clienteRes = await client.query(
      "INSERT INTO clientes (pyme_id, nombre, telefono) VALUES ($1, $2, $3) RETURNING cliente_id",
      [1, "Juan Perez", ""]
    );
    const clienteId = clienteRes.rows[0].cliente_id;
    console.log("Cliente ID:", clienteId);

    const citaRes = await client.query(`
      INSERT INTO citas (pyme_id, cliente_id, miembro_equipo_id, fecha, hora, estado)
      VALUES ($1, $2, $3, $4, $5, 'pendiente') RETURNING *
    `, [1, clienteId, null, "2023-12-01", "14:00"]);
    console.log("Cita inserted:", citaRes.rows[0]);
    await client.query("ROLLBACK");
  } catch(e) {
    console.error("SQL Error:", e);
  } finally {
    client.release();
    pool.end();
  }
}
run();
