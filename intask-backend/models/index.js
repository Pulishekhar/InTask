const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const sequelize = require('../config/db');
const basename = path.basename(__filename);

const db = {};

// Load all models
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Handle associations with deferred approach to avoid circular dependencies
Object.keys(db).forEach(modelName => {
  if (typeof db[modelName].associate === 'function') {
    db[modelName].associate(db);
  }
});

// Add class/instance methods if needed
Object.keys(db).forEach(modelName => {
  if (typeof db[modelName].addScopes === 'function') {
    db[modelName].addScopes(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Add sync method with proper error handling
db.syncDatabase = async (options = {}) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    }
    
    await sequelize.sync(options);
    
    if (process.env.NODE_ENV === 'development') {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    }
    
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Database synchronization failed:', error);
    throw error;
  }
};

module.exports = db;