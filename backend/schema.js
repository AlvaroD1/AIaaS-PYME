require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }});
const query = `
  SELECT table_name, column_name, data_type 
  FROM information_schema.columns 
  WHERE table_schema = 'public' 
    AND table_name IN ('citas', 'equipo_medico', 'horarios', 'alertas', 'clientes')
  ORDER BY table_name, ordinal_position;
`;
pool.query(query)
  .then(res => { console.log(JSON.stringify(res.rows, null, 2)); pool.end(); })
  .catch(console.error);
