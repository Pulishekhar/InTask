const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const taskController = require('../controllers/taskController');

const verifyControllerMethods = () => {
  const requiredMethods = ['getTasks', 'createTask', 'updateTask', 'deleteTask'];
  requiredMethods.forEach(method => {
    if (typeof taskController[method] !== 'function') {
      throw new Error(`Controller method ${method} is not a function`);
    }
  });
};

try {
  verifyControllerMethods();
  console.log('All task controller methods are valid functions');
  
  router.get('/', protect, taskController.getTasks);
  router.post('/', protect, restrictTo('admin', 'lead'), taskController.createTask);
  router.patch('/:id', protect, taskController.updateTask);
  router.delete('/:id', protect, restrictTo('admin', 'lead'), taskController.deleteTask);
  
  module.exports = router;
} catch (error) {
  console.error('❌ Route initialization failed:', error.message);
  process.exit(1);
}