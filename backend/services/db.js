const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false // This is CRITICAL for AWS RDS connection
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};

console.log("📡 Connecting to RDS host:", process.env.DB_HOST);