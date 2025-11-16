const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { initDatabase } = require('./database');
const queryRoutes = require('./routes/queries');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize database
initDatabase();

// API Routes
app.use('/api/queries', queryRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Serve static files from the React app in production
// Check if build folder exists or NODE_ENV is production
const buildPath = path.join(__dirname, '../client/build');
const isProduction = process.env.NODE_ENV === 'production' || fs.existsSync(buildPath);

if (isProduction && fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  
  // The "catchall" handler: for any request that doesn't
  // match one above, send back React's index.html file.
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


