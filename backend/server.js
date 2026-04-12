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
    // We added runner_id and status to support the full task lifecycle
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS errands (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT DEFAULT 'No description',
        budget INT NOT NULL,
        location VARCHAR(255) DEFAULT 'Remote',
        client_id INT DEFAULT 1,
        runner_id INT DEFAULT NULL,
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

// 0. Health Checks (For AWS Load Balancer)
app.get('/', (req, res) => res.status(200).send('OK'));
app.get('/health', (req, res) => res.status(200).send('Healthy'));

// 1. PUBLIC FEED: GET All Available Errands
// Only shows 'PENDING' tasks so they "disappear" once someone is hired
app.get('/errands', async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM errands WHERE status = 'PENDING' ORDER BY created_at DESC"
    );
    res.json(result.rows); 
  } catch (err) {
    console.error("❌ DB ERROR (GET Feed):", err.message);
    res.status(500).json({ error: "Could not load feed.", details: err.message });
  }
});

// 2. USER DASHBOARD: GET tasks posted by a specific user
app.get('/errands/user/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    const result = await db.query(
      'SELECT * FROM errands WHERE client_id = $1 ORDER BY created_at DESC', 
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ DB ERROR (User Dashboard):", err.message);
    res.status(500).json({ error: "Failed to load dashboard." });
  }
});

// 3. POST New Errand
app.post('/errands', async (req, res) => {
  const { title, description, budget, location, clientId } = req.body;
  if (!title || !budget) return res.status(400).json({ error: "Title and Budget required!" });

  try {
    const queryText = `
      INSERT INTO errands (title, description, budget, location, client_id, status) 
      VALUES ($1, $2, $3, $4, $5, 'PENDING') 
      RETURNING *`;
    const values = [title, description || "No description", budget, location || "Remote", clientId || 1];
    const result = await db.query(queryText, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Post failed", details: err.message });
  }
});

// 4. POST a Bid (Applying for a task)
app.post('/bids', async (req, res) => {
  const { errand_id, bid_amount, runner_id } = req.body;
  try {
    const query = 'INSERT INTO bids (errand_id, bid_amount, runner_id) VALUES ($1, $2, $3) RETURNING *';
    const result = await db.query(query, [errand_id, bid_amount, runner_id]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Bid failed. Ensure table exists." });
  }
});

// 5. ACCEPT RUNNER: Update task status and assign runner
app.patch('/errands/:id/accept', async (req, res) => {
  const errandId = req.params.id;
  const { runner_id } = req.body; 

  try {
    const query = `
      UPDATE errands 
      SET status = 'IN_PROGRESS', runner_id = $1 
      WHERE id = $2 RETURNING *`;
    const result = await db.query(query, [runner_id, errandId]);
    res.json({ message: "Task started!", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Assignment failed." });
  }
});

// 6. S3 Image Upload
app.get('/upload-url', async (req, res) => {
  const { fileName } = req.query;
  try {
    const url = await getUploadUrl(fileName);
    res.json({ uploadUrl: url });
  } catch (err) {
    res.status(500).json({ error: "S3 Error" });
  }
});

// --- START SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 ErrandMate Backend Live on Port ${PORT}`);
});