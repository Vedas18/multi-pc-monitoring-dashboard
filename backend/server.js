const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const systemDataRoutes = require('./routes/systemData');

// ✅ Import model (REQUIRED for index sync)
const SystemInfo = require('./models/SystemInfo');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ Connected to MongoDB successfully');

  // 🔥 IMPORTANT: Sync indexes (TTL, compound index)
  await SystemInfo.syncIndexes();
  console.log('📌 MongoDB indexes synced');

})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// MongoDB connection event handlers
mongoose.connection.on('connected', () => {
  console.log('📊 MongoDB connected');
});

mongoose.connection.on('error', (error) => {
  console.error('📊 MongoDB error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('📊 MongoDB disconnected');
});

// Routes
app.use('/api/systemdata', systemDataRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Multi-PC System Monitoring Dashboard API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error'
  });
});

// Graceful shutdown
async function shutdown(signal) {
  console.log(`\n🛑 ${signal} received. Shutting down gracefully...`);
  try {
    await mongoose.connection.close();
    console.log('📊 MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    console.error('Shutdown error:', err);
    process.exit(1);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 Multi-PC System Monitoring Backend
📡 Port: ${PORT}
🌐 Environment: ${process.env.NODE_ENV || 'production'}
⏰ Started: ${new Date().toISOString()}
  `);
});

module.exports = app;
