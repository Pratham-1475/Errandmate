require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./services/db');
const { getUploadUrl } = require('./services/s3Service');

const app = express();

// --- Middleware ---
app.use(cors({ origin: "*" })); // Allows Member 1's frontend to talk to your API
app.use(express.json());

// --- DATABASE AUTO-MIGRATION (Member 1 & 4's Sync) ---
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

// --- MOCK DATA (Fallback if DB fails) ---
const mockErrands = [
  { id: 1, title: "Pick up Lab Manual", budget: 50, location: "Library", description: "Need it by 5 PM" },
  { id: 2, title: "Buy Groceries", budget: 200, location: "Sector 15", description: "Milk, Bread, Eggs" }
];

// --- ROUTES ---

// 0. Root Health Check (CRITICAL: Fixes the 502 Bad Gateway)
app.get('/', (req, res) => {
  res.status(200).send('OK');
});

// 1. AWS Health Check
app.get('/health', (req, res) => {
  res.status(200).send('Healthy');
});

/// --- 2. GET All Errands (Debug Version) ---
app.get('/errands', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM errands ORDER BY created_at DESC');
    
    // If connection works, this will return an array (even if empty [])
    res.json(result.rows); 
    
  } catch (err) {
    console.error("❌ REAL DB ERROR (GET):", err.message);
    res.status(500).json({ 
      error: "Database connection failed", 
      details: err.message 
    });
  }
});

// --- 3. POST New Errand (Debug Version) ---
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
    
    // We send a 500 error now instead of pretending it worked
    res.status(500).json({ 
      error: "Could not save to database", 
      details: err.message 
    });
  }
});

// 4. POST a Bid (RE-ADDED: Member 1 accidentally deleted this)
app.post('/bids', async (req, res) => {
  const { errandId, runnerId, amount, proposal } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO bids (errand_id, runner_id, amount, proposal) VALUES ($1, $2, $3, $4) RETURNING *',
      [errandId, runnerId, amount, proposal]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Bid Error:", err);
    res.status(500).json({ error: "Failed to place bid. Check table names!" });
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