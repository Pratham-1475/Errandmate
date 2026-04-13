require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./services/db');
const { getUploadUrl } = require('./services/s3Service');
const { 
  CognitoUserPool, 
  CognitoUserAttribute, 
  CognitoUser, 
  AuthenticationDetails 
} = require('amazon-cognito-identity-js');

const app = express();

// --- Middleware ---
app.use(cors({ origin: "*" })); 
app.use(express.json());
app.options('*', cors()); // Handle pre-flight for all routes

// --- AWS Cognito Configuration ---
const poolData = {
  UserPoolId: 'ap-south-1_6Bvo51spv', 
  ClientId: '2d1hru5gi208brq7hajo6m11b6'    
};
const userPool = new CognitoUserPool(poolData);

const formatUsername = (email) => email.toLowerCase().replace(/[@.]/g, "_");

// --- DATABASE INITIALIZATION ---
async function initDatabase() {
  console.log("🔄 Verifying AWS RDS Database Schema...");
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255), 
        qualifications TEXT,
        skills TEXT,
        role VARCHAR(50) DEFAULT 'client'
      );
      
      CREATE TABLE IF NOT EXISTS errands (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        budget INT NOT NULL,
        location VARCHAR(255),
        client_id INT REFERENCES users(id) ON DELETE CASCADE,
        runner_id INT REFERENCES users(id) ON DELETE SET NULL,
        status VARCHAR(50) DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS bids (
        id SERIAL PRIMARY KEY,
        errand_id INT REFERENCES errands(id) ON DELETE CASCADE,
        runner_id INT REFERENCES users(id) ON DELETE CASCADE,
        bid_amount INT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_bid UNIQUE(errand_id, runner_id)
      );
    `);
    console.log("✅ AWS RDS: Database tables verified and ready.");
  } catch (err) {
    console.error("❌ Database Initialization Error:", err.message);
  }
}
initDatabase();

// --- 1. AUTHENTICATION ROUTES ---

app.post('/signup', (req, res) => {
  const { name, email, password, qualifications, skills } = req.body;
  const username = formatUsername(email);
  const attributeList = [
    new CognitoUserAttribute({ Name: 'name', Value: name }),
    new CognitoUserAttribute({ Name: 'email', Value: email.toLowerCase() })
  ];

  userPool.signUp(username, password, attributeList, null, async (err, result) => {
    if (err) return res.status(400).json({ error: err.message });

    try {
      const query = `
        INSERT INTO users (name, email, password, qualifications, skills) 
        VALUES ($1, $2, 'COGNITO_MANAGED', $3, $4) 
        ON CONFLICT (email) DO UPDATE SET name = $1, qualifications = $3, skills = $4
        RETURNING *`;
      const dbResult = await db.query(query, [name, email.toLowerCase(), qualifications, skills]);
      res.status(201).json(dbResult.rows[0]);
    } catch (dbErr) {
      res.status(500).json({ error: "RDS Sync Failed", details: dbErr.message });
    }
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const authenticationDetails = new AuthenticationDetails({
    Username: formatUsername(email), Password: password,
  });
  const userData = { Username: formatUsername(email), Pool: userPool };
  const cognitoUser = new CognitoUser(userData);

  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: async (session) => {
      try {
        const dbResult = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
        res.status(200).json(dbResult.rows[0]);
      } catch (err) { res.status(500).json({ error: "Database fetch failed" }); }
    },
    onFailure: (err) => res.status(401).json({ error: err.message }),
  });
});

// --- 2. ERRAND MANAGEMENT ROUTES ---

app.get('/errands', async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM errands WHERE status = 'PENDING' ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: "Fetch errands failed" }); }
});

// Fetch tasks posted by the user
app.get('/errands/user/:id', async (req, res) => {
  const userId = parseInt(req.params.id);
  if (isNaN(userId)) return res.status(400).json({ error: "Invalid ID" });
  try {
    const result = await db.query('SELECT * FROM errands WHERE client_id = $1', [userId]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: "Dashboard fetch failed" }); }
});

// NEW: Fetch tasks that the user has applied for
app.get('/errands/applied/:id', async (req, res) => {
  const runnerId = parseInt(req.params.id);
  if (isNaN(runnerId)) return res.status(400).json({ error: "Invalid User ID" });

  try {
    const query = `
      SELECT e.*, b.bid_amount, b.status as bid_status 
      FROM errands e 
      JOIN bids b ON e.id = b.errand_id 
      WHERE b.runner_id = $1`;
    
    const result = await db.query(query, [runnerId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch applied tasks." });
  }
});

app.post('/errands', async (req, res) => {
  const { title, description, budget, location, clientId } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO errands (title, description, budget, location, client_id) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, description, parseInt(budget), location, parseInt(clientId)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: "Errand post failed" }); }
});

// --- 3. BIDDING & HIRING ---

app.get('/errands/:id/bids', async (req, res) => {
  try {
    const query = `
      SELECT b.id as bid_id, b.bid_amount, b.runner_id, u.name, u.qualifications, u.skills 
      FROM bids b 
      JOIN users u ON b.runner_id = u.id 
      WHERE b.errand_id = $1`;
    const result = await db.query(query, [parseInt(req.params.id)]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: "Fetch bids failed" }); }
});

app.post('/bids', async (req, res) => {
  const { errand_id, bid_amount, runner_id } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO bids (errand_id, bid_amount, runner_id) VALUES ($1, $2, $3) RETURNING *',
      [parseInt(errand_id), parseInt(bid_amount), parseInt(runner_id)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: "Bid submission failed" }); }
});

app.patch('/errands/:id/accept', async (req, res) => {
  const errandId = parseInt(req.params.id);
  const { runner_id } = req.body;
  try {
    const result = await db.query(
      'UPDATE errands SET runner_id = $1, status = $2 WHERE id = $3 RETURNING *',
      [parseInt(runner_id), 'IN_PROGRESS', errandId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Errand not found" });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: "Failed to hire runner" }); }
});

// --- 4. INFRASTRUCTURE ---
app.get('/', (req, res) => res.status(200).send('🚀 ErrandMate Professional Cloud API is Live'));

app.get('/upload-url', async (req, res) => {
  try {
    const url = await getUploadUrl(req.query.fileName);
    res.json({ uploadUrl: url });
  } catch (err) { res.status(500).json({ error: "S3 URL generation failed" }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on Port ${PORT}`));