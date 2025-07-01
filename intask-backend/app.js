const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models');
require('dotenv').config();

const app = express();

// Routes
const userRoutes = require('./routes/userRoutes');

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Removed: app.options('*', cors());

// Mount user route early
app.use('/api/users', userRoutes);

// ✅ Health check endpoint with proper async check
app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      status: 'healthy',
      database: 'connected',
      env: process.env.NODE_ENV || 'development'
    });
  } catch {
    res.json({
      status: 'healthy',
      database: 'disconnected',
      env: process.env.NODE_ENV || 'development'
    });
  }
});

// Route mounting with error handling
const mountRoutes = () => {
  const routes = [
    { path: '/api/auth', router: require('./routes/authRoutes') },
    { path: '/api/tasks', router: require('./routes/taskRoutes') },
    { path: '/api/projects', router: require('./routes/projectRoutes') },
    { path: '/api/teams', router: require('./routes/teamRoutes') },
    { path: '/api/admin', router: require('./routes/adminRoutes') },
    { path: '/api/dashboard', router: require('./routes/dashboardRoutes') }
  ];

  routes.forEach(({ path, router }) => {
    try {
      app.use(path, router);
      console.log(`✅ Route ${path} mounted successfully`);
    } catch (err) {
      console.error(`❌ Failed to mount route ${path}:`, err);
      process.exit(1);
    }
  });
};

// Initialize DB
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('🔁 Database synchronized');
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  await initializeDatabase();
  mountRoutes();

  // Global error handler
  app.use((err, req, res, next) => {
    console.error('Global error handler:', {
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });

    res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌱 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();

module.exports = app;
