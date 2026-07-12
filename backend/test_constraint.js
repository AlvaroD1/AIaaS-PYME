require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }});
pool.query("SELECT pg_get_constraintdef(c.oid) AS constraint_def FROM pg_constraint c JOIN pg_class t ON c.conrelid = t.oid WHERE t.relname = 'citas' AND c.conname = 'citas_estado_check';")
  .then(res => { console.log(res.rows[0]); pool.end(); })
  .catch(console.error);
