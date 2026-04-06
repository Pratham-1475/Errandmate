const { Pool } = require('pg');

// This will connect to Member 4's AWS RDS later
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required for AWS RDS
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};