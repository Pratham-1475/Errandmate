require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import our internal services
const db = require('./services/db');
const { getUploadUrl } = require('./services/s3Service');

const app = express();

// --- Middleware ---
// CORS allows Member 1's frontend to talk to your backend without security blocks
app.use(cors());
app.use(express.json());

// --- ROUTES ---

// 1. AWS Health Check (Required for Member 3's Load Balancer)
// Link: http://ErrandMate-ALB-1811716317.ap-south-1.elb.amazonaws.com/health
app.get('/health', (req, res) => {
  res.status(200).send('Healthy');
});

// 2. GET All Errands (REAL RDS Database)
// Route changed to /errands to match Member 1's frontend calls
app.get('/errands', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM errands ORDER BY created_at DESC');
    
    // If database is empty, return a friendly message so Member 1 knows it's connected
    if (result.rows.length === 0) {
      return res.json([{ id: 0, title: "No errands found in RDS", budget: 0, location: "System" }]);
    }
    
    res.json(result.rows);
  } catch (err) {
    console.error("GET Error:", err.message);
    res.status(500).json({ error: "Failed to fetch errands from Database." });
  }
});

// 3. POST New Errand (REAL RDS Database)
// Handles Member 1's "Post Errand" button
app.post('/errands', async (req, res) => {
  const { title, description, budget, location, clientId } = req.body;
  
  console.log("🚀 Incoming Post Request:", req.body);

  // Validation: Title and Budget are mandatory
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
    
    console.log("✅ Saved to AWS RDS. ID:", result.rows[0].id);
    res.status(201).json({
      message: "Handshake Successful! Saved to RDS.",
      data: result.rows[0]
    });
  } catch (err) {
    console.error("POST Error:", err.message);
    res.status(500).json({ error: "Database save failed. Ensure Member 4 created the table." });
  }
});

// 4. S3 Image Upload (Generate Presigned URL)
// Used when users attach a photo to an errand
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