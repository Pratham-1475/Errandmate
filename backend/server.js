require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import our internal services
const db = require('./services/db');
const { getUploadUrl } = require('./services/s3Service');

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- ROUTES ---

// 1. AWS Health Check (Required for Member 3's Load Balancer)
// If this returns 200, the ALB knows your server is alive.
app.get('/health', (req, res) => {
  res.status(200).send('Healthy');
});

// 2. GET All Errands (Live Database)
app.get('/errands', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM errands ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error("GET Error:", err);
    res.status(500).json({ error: "Failed to fetch errands from Database." });
  }
});

// 3. POST New Errand (Live Database)
app.post('/errands', async (req, res) => {
  const { title, description, budget, location, clientId } = req.body;

  // Basic validation
  if (!title || !budget) {
    return res.status(400).json({ error: "Title and Budget are required!" });
  }

  try {
    const result = await db.query(
      'INSERT INTO errands (title, description, budget, location, client_id, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [
        title, 
        description || "No description", 
        budget, 
        location || "Remote", 
        clientId || 1, 
        'PENDING'
      ]
    );
    
    console.log("Errand Saved to RDS:", result.rows[0].id);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST Error:", err);
    res.status(500).json({ error: "Failed to save errand. Check DB connection." });
  }
});

// 4. S3 Image Upload (Generate Presigned URL)
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
  console.log(`🚀 ErrandMate Backend Live!`);
  console.log(`📡 Local: http://localhost:${PORT}`);
  console.log(`🌐 AWS ALB: http://ErrandMate-ALB-1811716317.ap-south-1.elb.amazonaws.com`);
});