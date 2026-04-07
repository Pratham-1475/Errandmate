require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- ROUTES ---

// 1. AWS Health Check (Required for Member 3's Load Balancer)
app.get('/health', (req, res) => {
  res.status(200).send('Healthy');
});

// 2. Mock GET Route (Already working)
app.get('/errands', (req, res) => {
  const mockErrands = [
    { id: 1, title: "Pick up Groceries", budget: 500, location: "Sector 7" },
    { id: 2, title: "Fix My Laptop", budget: 1500, location: "Hostel B" }
  ];
  res.json(mockErrands);
});

// 3. NEW Mock POST Route (Fixed for Member 1)
app.post('/errands', (req, res) => {
  const { title, budget, description, location } = req.body;
  
  // Log it so YOU can see what Member 1 is sending in your terminal
  console.log("Member 1 sent an errand:", req.body);

  // Return a fake success message so Member 1's frontend doesn't crash
  res.status(201).json({ 
    message: "Mock Success!", 
    data: { 
      id: Date.now(), 
      title, 
      budget, 
      status: "PENDING" 
    } 
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 ErrandMate Backend live on http://localhost:${PORT}`);
  console.log(`Ready for Member 1's testing!`);
});