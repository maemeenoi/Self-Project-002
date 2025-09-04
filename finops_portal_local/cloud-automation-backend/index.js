const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const { initDb } = require('./lib/database');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const dashboardRoutes = require('./routes/dashboard');

// Initialize database and create tables if they don't exist
initDb();

const app = express();
const PORT = process.env.PORT || 3001;

// Global middleware
app.use(cors());
app.use(bodyParser.json());

// Attach route handlers
app.use('/api', authRoutes);
app.use('/api', uploadRoutes);
app.use('/api', dashboardRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'FinOps backend is running' });
});

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});