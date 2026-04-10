const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'ErrandMate2026!',
  // HARDCODED ENDPOINT TO PREVENT 127.0.0.1 ERRORS
  host: 'errandmate-db.c1iqs2c4y7sx.ap-south-1.rds.amazonaws.com', 
  database: process.env.DB_NAME || 'postgres',
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};

console.log("📡 DATABASE: Hardcoded RDS handshake initiated.");