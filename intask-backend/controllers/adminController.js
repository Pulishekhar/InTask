// controllers/adminController.js
const { Project, User, Team } = require('../models');
const { Op } = require('sequelize');

exports.getDashboardStats = async (req, res) => {
  try {
    const [totalTeams, totalMembers, activeProjects, completedTasks] = await Promise.all([
      Team.count(),
      User.count({ 
        where: { 
          role: { 
            [Op.ne]: 'admin' 
          } 
        } 
      }),  // Fixed syntax
      Project.count({ 
        where: { 
          status: { 
            [Op.ne]: 'completed' 
          } 
        } 
      }),  // Fixed syntax
      Project.count({ 
        where: { 
          status: 'completed' 
        } 
      })
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalTeams,
        totalMembers,
        activeProjects,
        completedTasks
      }
    });
  } catch (error) {
    console.error('❌ Admin stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard stats'
    });
  }
};