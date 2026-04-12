require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./services/db');
const { getUploadUrl } = require('./services/s3Service');

const app = express();

// --- Middleware ---
app.use(cors({ origin: "*" })); 
app.use(express.json());

// --- DATABASE AUTO-MIGRATION ---
async function initDatabase() {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS errands (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT DEFAULT 'No description',
        budget INT NOT NULL,
        location VARCHAR(255) DEFAULT 'Remote',
        client_id INT DEFAULT 1,
        status VARCHAR(50) DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await db.query(createTableQuery);
    console.log("✅ AWS RDS: 'errands' table is verified and ready.");
  } catch (err) {
    console.error("❌ Database initialization failed:", err.message);
  }
}

initDatabase();

// --- ROUTES ---

// 0. Root Health Check (CRITICAL: Fixes the 502 Bad Gateway)
app.get('/', (req, res) => {
  res.status(200).send('OK');
});

// 1. AWS Health Check
app.get('/health', (req, res) => {
  res.status(200).send('Healthy');
});

// 2. GET All Errands
app.get('/errands', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM errands ORDER BY created_at DESC');
    res.json(result.rows); 
  } catch (err) {
    console.error("❌ REAL DB ERROR (GET):", err.message);
    res.status(500).json({ 
      error: "Database connection failed", 
      details: err.message 
    });
  }
});

// 3. POST New Errand
app.post('/errands', async (req, res) => {
  const { title, description, budget, location, clientId } = req.body;
  console.log("🚀 Incoming Post Request:", req.body);

  if (!title || !budget) {
    return res.status(400).json({ error: "Title and Budget are required!" });
  }

  try {
    const queryText = `
      INSERT INTO errands (title, description, budget, location, client_id, status) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *`;
    
    const values = [
      title, 
      description || "No description", 
      budget, 
      location || "Remote", 
      clientId || 1, 
      'PENDING'
    ];

    const result = await db.query(queryText, values);
    console.log("✅ Saved to AWS RDS. ID:", result.rows[0].id);
    res.status(201).json({ message: "Saved to RDS.", data: result.rows[0] });

  } catch (err) {
    console.error("❌ REAL DB ERROR (POST):", err.message);
    res.status(500).json({ error: "Could not save to database", details: err.message });
  }
});

// 4. POST a Bid (Synced with Member 1's Variable Names)
app.post('/bids', async (req, res) => {
  const { errand_id, bid_amount, runner_id } = req.body;
  
  try {
    console.log(`📥 New Bid Received: Errand #${errand_id} by Runner #${runner_id}`);
    
    const query = 'INSERT INTO bids (errand_id, bid_amount, runner_id) VALUES ($1, $2, $3) RETURNING *';
    const result = await db.query(query, [errand_id, bid_amount, runner_id]);
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Bid Error:", err.message);
    res.status(500).json({ error: "Failed to place bid. Check if table 'bids' exists!" });
  }
});

// 5. S3 Image Upload
app.get('/upload-url', async (req, res) => {
  const { fileName } = req.query;
  if (!fileName) return res.status(400).json({ error: "Filename is required" });

  try {
    const url = await getUploadUrl(fileName);
    res.json({ uploadUrl: url });
  } catch (err) {
    console.error("S3 Error:", err);
    res.status(500).json({ error: "Could not generate S3 upload URL." });
  }
});

// --- START SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 ErrandMate Backend Live on Port ${PORT}`);
});