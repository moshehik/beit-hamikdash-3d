const { Pool } = require('pg');
let pool;
exports.pool = () => (pool ||= new Pool({ connectionString: process.env.DATABASE_URL, max: 1, ssl: { rejectUnauthorized: false } }));
