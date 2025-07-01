const { Task, Project, User } = require('../models');

class TaskController {
  static async getTasks(req, res) {
    try {
      const { projectId } = req.query;
      const where = {};

      if (projectId) where.projectId = projectId;

      // Non-admin users can only access tasks from their team
      if (req.user.role !== 'admin') {
        where['$project.teamId$'] = req.user.teamId; // Use the alias 'project'
      }

      const tasks = await Task.findAll({
        where,
        include: [
          { model: Project, as: 'project' }, // <-- use alias!
          // Optionally, include assignee if needed:
          // { model: User, as: 'assignee' }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: tasks
      });
    } catch (error) {
      console.error('❌ Error fetching tasks:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch tasks'
      });
    }
  }

  static async createTask(req, res) {
    try {
      const { title, description, dueDate, projectId } = req.body;

      if (!title || !projectId) {
        return res.status(400).json({
          success: false,
          error: 'Title and project ID are required'
        });
      }

      const task = await Task.create({
        title,
        description,
        dueDate,
        status: 'todo',
        projectId,
        // createdBy: req.user.id // if you have this field
      });

      res.status(201).json({
        success: true,
        data: task
      });
    } catch (error) {
      console.error('❌ Error creating task:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  static async updateTask(req, res) {
    try {
      const task = await Task.findByPk(req.params.id, {
        include: [{ model: Project, as: 'project' }] // <-- use alias!
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'Task not found'
        });
      }

      // Authorization: Admins can update any, others only if from their team
      if (req.user.role !== 'admin' && task.project.teamId !== req.user.teamId) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to update this task'
        });
      }

      const updatedTask = await task.update(req.body);
      res.status(200).json({
        success: true,
        data: updatedTask
      });
    } catch (error) {
      console.error('❌ Error updating task:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  static async deleteTask(req, res) {
    try {
      const task = await Task.findByPk(req.params.id, {
        include: [{ model: Project, as: 'project' }] // <-- use alias!
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'Task not found'
        });
      }

      if (req.user.role !== 'admin' && task.project.teamId !== req.user.teamId) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to delete this task'
        });
      }

      await task.destroy();
      res.status(204).end();
    } catch (error) {
      console.error('❌ Error deleting task:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = TaskController;
