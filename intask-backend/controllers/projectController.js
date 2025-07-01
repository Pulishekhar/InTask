// controllers/projectController.js
const { Op } = require('sequelize');
const { Project } = require('../models');

class ProjectController {
  static async getAllProjects(req, res) {
    try {
      let projects;
      const { role, teamId, id: userId } = req.user;

      switch (role) {
        case 'admin':
          projects = await Project.findAll();
          break;
        case 'lead':
          projects = await Project.findAll({
            where: {
              [Op.or]: [{ createdBy: userId }, { teamId }]
            }
          });
          break;
        case 'member':
          projects = await Project.findAll({ where: { teamId } });
          break;
        default:
          return res.status(403).json({ success: false, error: 'Unauthorized access' });
      }

      return res.status(200).json({ success: true, data: projects });
    } catch (error) {
      console.error("❌ Error fetching projects:", error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  static async createProject(req, res) {
    try {
      const { name, description, dueDate } = req.body;
      const { role, teamId: userTeamId, id: userId } = req.user;

      if (!name) {
        return res.status(400).json({ success: false, error: 'Project name is required' });
      }

      if (role === 'admin') {
        return res.status(403).json({ success: false, error: 'Admins are not allowed to create projects' });
      }

      if (role === 'lead' && !userTeamId) {
        return res.status(400).json({ success: false, error: 'You are not assigned to a team' });
      }

      const project = await Project.create({
        name,
        description,
        dueDate,
        status: 'inProgress',
        teamId: userTeamId,
        createdBy: userId
      });

      return res.status(201).json({ success: true, data: project });
    } catch (error) {
      console.error("❌ Error creating project:", error);
      return res.status(400).json({
        success: false,
        error: error.message,
        validation: 'Check if teamId matches your assigned team'
      });
    }
  }

  static async updateProject(req, res) {
    try {
      const project = await Project.findByPk(req.params.id);
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }

      const { role, id: userId } = req.user;

      if (!(role === 'lead' && project.createdBy === userId)) {
        return res.status(403).json({ success: false, error: 'Not authorized to modify this project' });
      }

      const updatedProject = await project.update(req.body);
      return res.status(200).json({ success: true, data: updatedProject });
    } catch (error) {
      console.error("❌ Error updating project:", error);
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async deleteProject(req, res) {
    try {
      const project = await Project.findByPk(req.params.id);
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }

      const { role, id: userId } = req.user;

      if (!(role === 'lead' && project.createdBy === userId)) {
        return res.status(403).json({ success: false, error: 'Not authorized to delete this project' });
      }

      await project.destroy();
      return res.status(204).end();
    } catch (error) {
      console.error("❌ Error deleting project:", error);
      return res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = ProjectController;

// controllers/dashboardController.js

exports.getAdminDashboard = async (req, res) => {
  try {
    const totalTeams = await Team.count();
    const totalMembers = await User.count({ where: { role: 'user' } });
    const totalProjects = await Project.count();
    const activeProjects = await Project.count({
      where: { status: { [Op.in]: ['todo', 'inProgress'] } }
    });
    const completedTasks = await Task.count({ where: { status: 'done' } });

    res.status(200).json({
      totalTeams,
      totalMembers,
      totalProjects,
      activeProjects,
      completedTasks,
    });
  } catch (error) {
    console.error("❌ [getAdminDashboard] Error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};
