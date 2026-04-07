require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./services/db');
const { getUploadUrl } = require('./services/s3Service');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Check if Backend is alive
app.get('/api/errands', (req, res) => {
  // Temporary fake data until Member 4 gives us the RDS link
  const mockErrands = [
    { id: 1, title: "Pick up Groceries", budget: 500, location: "Sector 7" },
    { id: 2, title: "Fix My Laptop", budget: 1500, location: "Hostel B" }
  ];
  res.json(mockErrands);
});

// 2. Member 1 uses this to Post an Errand
app.post('/api/errands', async (req, res) => {
  const { title, description, budget, location, clientId } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO errands (title, description, budget, location, client_id, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, description, budget, location, clientId, 'PENDING']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "DB Error. Check if Member 4 set up the table!" });
  }
});

// 3. Member 1 uses this for Image Uploads
app.get('/api/upload-url', async (req, res) => {
  try {
    const { fileName } = req.query;
    const url = await getUploadUrl(fileName);
    res.json({ uploadUrl: url });
  } catch (err) {
    res.status(500).json({ error: "S3 Error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));