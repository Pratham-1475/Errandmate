require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import your new services (We created these in the previous step)
const db = require('./services/db');
const { getUploadUrl } = require('./services/s3Service');

const app = express();

// --- Middleware ---
app.use(cors()); 
app.use(express.json());

// --- Routes ---

// 1. Health Check (To see if the server is alive)
app.get('/', (req, res) => {
  res.json({ project: "ErrandMate API", status: "Online" });
});

// 2. CREATE Errand (This connects to the Database)
app.post('/api/errands', async (req, res) => {
  const { title, description, budget, location, clientId } = req.body;

  try {
    const result = await db.query(
      'INSERT INTO errands (title, description, budget, location, client_id, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, description, budget, location, clientId, 'PENDING']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ error: "Failed to save errand to Database." });
  }
});

// 3. GET Upload URL (For S3 Image Uploads)
app.get('/api/upload-url', async (req, res) => {
  try {
    const { fileName } = req.query;
    if (!fileName) return res.status(400).json({ error: "Filename is required" });
    
    const url = await getUploadUrl(fileName);
    res.json({ uploadUrl: url });
  } catch (err) {
    console.error("S3 Error:", err);
    res.status(500).json({ error: "Failed to generate upload URL." });
  }
});

// --- Start Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 ErrandMate Backend live at http://localhost:${PORT}`);
});