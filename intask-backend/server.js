require('dotenv').config();
const app = require('./app');
const PORT = process.env.PORT || 5000;

// Start server with error handling
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('🔥 Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});