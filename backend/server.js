require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer'); // Added for OTP
const db = require('./services/db');
const { getUploadUrl } = require('./services/s3Service');

const app = express();

// --- Middleware ---
app.use(cors({ origin: "*" })); 
app.use(express.json());

// --- OTP STORE (Temporary) ---
const otpStore = {}; 

// --- DATABASE AUTO-MIGRATION ---
async function initDatabase() {
  try {
    // Ensuring tables support the 'Assigned' and 'Hired' logic
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        qualifications TEXT,
        skills TEXT
      );
      
      CREATE TABLE IF NOT EXISTS errands (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        budget INT NOT NULL,
        location VARCHAR(255),
        client_id INT,
        runner_id INT DEFAULT NULL,
        status VARCHAR(50) DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS bids (
        id SERIAL PRIMARY KEY,
        errand_id INT,
        runner_id INT,
        bid_amount INT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ AWS RDS: Schema verified (Users, Errands, Bids).");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
  }
}
initDatabase();

// --- 1. AUTH / OTP ROUTES ---

app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS 
    }
  });

  try {
    await transporter.sendMail({
      from: '"ErrandMate Campus" <noreply@errandmate.com>',
      to: email,
      subject: "Your ErrandMate Verification Code",
      text: `Your OTP is: ${otp}. Use this to verify your campus email.`
    });
    otpStore[email] = otp; 
    res.status(200).json({ message: "OTP sent successfully!" });
  } catch (err) {
    console.error("Email Error:", err.message);
    res.status(500).json({ error: "Failed to send email." });
  }
});

// --- 2. USER PROFILE ROUTES ---

app.get('/user/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT name, qualifications, skills FROM users WHERE id = $1', [req.params.id]);
    res.json(result.rows[0] || { error: "User not found" });
  } catch (err) {
    res.status(500).json({ error: "Profile fetch failed." });
  }
});

// --- 3. ERRAND & FEED ROUTES ---

app.get('/errands', async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM errands WHERE status = 'PENDING' ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Feed failed." });
  }
});

app.post('/errands', async (req, res) => {
  const { title, description, budget, location, clientId } = req.body;
  try {
    const query = `INSERT INTO errands (title, description, budget, location, client_id) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    const result = await db.query(query, [title, description, budget, location, clientId]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Post failed." });
  }
});

// --- 4. BID & HANDSHAKE ROUTES ---

// GET bids for a specific errand WITH Bidder Profiles (JOIN)
app.get('/errands/:id/bids', async (req, res) => {
  try {
    const query = `
      SELECT b.*, u.name, u.qualifications, u.skills 
      FROM bids b 
      JOIN users u ON b.runner_id = u.id 
      WHERE b.errand_id = $1`;
    const result = await db.query(query, [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch bids with profiles." });
  }
});

app.post('/bids', async (req, res) => {
  const { errand_id, bid_amount, runner_id } = req.body;
  try {
    const result = await db.query('INSERT INTO bids (errand_id, bid_amount, runner_id) VALUES ($1, $2, $3) RETURNING *', [errand_id, bid_amount, runner_id]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Bid submission failed." });
  }
});

// ACCEPTANCE LOGIC: Updates both Errand and Bid status
app.post('/bids/accept', async (req, res) => {
  const { errand_id, runner_id } = req.body;
  try {
    await db.query("UPDATE errands SET status = 'assigned', runner_id = $1 WHERE id = $2", [runner_id, errand_id]);
    await db.query("UPDATE bids SET status = 'hired' WHERE errand_id = $1 AND runner_id = $2", [errand_id, runner_id]);
    res.json({ message: "Handshake complete. Errand assigned!" });
  } catch (err) {
    res.status(500).json({ error: "Acceptance failed." });
  }
});

// --- 5. INFRASTRUCTURE ---
app.get('/', (req, res) => res.status(200).send('OK'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 ErrandMate Advanced Backend Live on Port ${PORT}`));