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

// --- AWS Cognito Configuration ---
const poolData = {
  UserPoolId: 'ap-south-1_6Bvo51spv', 
  ClientId: '2d1hru5gi208brq7hajo6m11b6'    
};
const userPool = new CognitoUserPool(poolData);

// Helper function to satisfy Cognito "Email Alias" configuration
const formatUsername = (email) => email.toLowerCase().replace(/[@.]/g, "_");

// --- DATABASE AUTO-MIGRATION ---
async function initDatabase() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
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
    console.log("✅ AWS RDS: Schema verified.");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
  }
}
initDatabase();

// --- 1. AUTH ROUTES (COGNITO + RDS) ---

app.post('/signup', (req, res) => {
  const { name, email, password, qualifications, skills } = req.body;
  
  const username = formatUsername(email); // Converts email to acceptable Cognito format
  const attributeList = [
    new CognitoUserAttribute({ Name: 'name', Value: name }),
    new CognitoUserAttribute({ Name: 'email', Value: email.toLowerCase() })
  ];

  userPool.signUp(username, password, attributeList, null, async (err, result) => {
    if (err) {
      console.error("❌ Cognito Signup Error:", err.message);
      return res.status(400).json({ error: err.message });
    }

    try {
      const query = `
        INSERT INTO users (name, email, qualifications, skills) 
        VALUES ($1, $2, $3, $4) 
        ON CONFLICT (email) DO UPDATE SET name = $1, qualifications = $3, skills = $4
        RETURNING *`;
      const dbResult = await db.query(query, [name, email.toLowerCase(), qualifications, skills]);
      res.status(201).json(dbResult.rows[0]);
    } catch (dbErr) {
      res.status(500).json({ error: "Cognito success, but RDS save failed.", details: dbErr.message });
    }
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const authenticationDetails = new AuthenticationDetails({
    Username: formatUsername(email),
    Password: password,
  });

  const userData = { Username: formatUsername(email), Pool: userPool };
  const cognitoUser = new CognitoUser(userData);

  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: async (session) => {
      try {
        const dbResult = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
        if (dbResult.rows.length > 0) {
          res.status(200).json(dbResult.rows[0]);
        } else {
          res.status(404).json({ error: "User found in Cognito but missing in RDS profile." });
        }
      } catch (dbErr) {
        res.status(500).json({ error: "Database fetch failed." });
      }
    },
    onFailure: (err) => {
      console.error("❌ Cognito Login Error:", err.message);
      res.status(401).json({ error: err.message });
    },
  });
});

// --- 2. ERRAND & BID ROUTES ---

app.get('/errands', async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM errands WHERE status = 'PENDING' ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Feed failed." });
  }
});

app.get('/errands/user/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM errands WHERE client_id = $1', [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Dashboard failed." });
  }
});

app.post('/errands', async (req, res) => {
  const { title, description, budget, location, clientId } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO errands (title, description, budget, location, client_id) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, description, budget, location, clientId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Post failed." });
  }
});

app.get('/errands/:id/bids', async (req, res) => {
  try {
    const query = `
      SELECT b.*, u.name as bidder_name, u.skills as bidder_skills 
      FROM bids b JOIN users u ON b.runner_id = u.id 
      WHERE b.errand_id = $1`;
    const result = await db.query(query, [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Fetch bids failed." });
  }
});

app.post('/bids', async (req, res) => {
  const { errand_id, bid_amount, runner_id } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO bids (errand_id, bid_amount, runner_id) VALUES ($1, $2, $3) RETURNING *',
      [errand_id, bid_amount, runner_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Bid failed." });
  }
});

// --- 3. INFRASTRUCTURE ---
app.get('/', (req, res) => res.status(200).send('ErrandMate Cloud API Live'));

app.get('/upload-url', async (req, res) => {
  const { fileName } = req.query;
  try {
    const url = await getUploadUrl(fileName);
    res.json({ uploadUrl: url });
  } catch (err) { res.status(500).json({ error: "S3 Error" }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 ErrandMate Backend Live on Port ${PORT}`));