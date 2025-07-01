const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const projectController = require('../controllers/projectController');

// Debug: Verify controller methods exist
console.log('Project Controller Methods:', {
  getAllProjects: typeof projectController.getAllProjects,
  createProject: typeof projectController.createProject,
  updateProject: typeof projectController.updateProject,
  deleteProject: typeof projectController.deleteProject
});

// Define routes
router.get('/', protect, projectController.getAllProjects);
router.post('/', protect, restrictTo('admin', 'lead'), projectController.createProject);
router.put('/:id', protect, restrictTo('admin', 'lead'), projectController.updateProject);
router.delete('/:id', protect, restrictTo('admin', 'lead'), projectController.deleteProject);

module.exports = router;