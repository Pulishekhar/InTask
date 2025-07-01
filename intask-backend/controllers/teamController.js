const { User, Team } = require('../models');

exports.getTeams = async (req, res) => {
  try {
    if (!['admin', 'lead'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Only admins and leads can view teams.' });
    }

    const whereCondition = req.user.role === 'admin' ? {} : { createdBy: req.user.id };
    
    const teams = await Team.findAll({
      where: whereCondition,
      include: [
        { 
          model: User, 
          as: 'members', 
          attributes: ['id', 'name', 'role', 'email'] 
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.status(200).json(teams);
  } catch (error) {
    console.error("❌ [getTeams] Failed:", error.message);
    res.status(500).json({ error: "Failed to fetch teams" });
  }
};

exports.createTeam = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can create teams' });
    }

    const team = await Team.create({ 
      name: req.body.name, 
      createdBy: req.user.id 
    });
    
    res.status(201).json(team);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Team name already exists' });
    }
    res.status(500).json({ error: 'Failed to create team' });
  }
};

exports.updateTeam = async (req, res) => {
  try {
    const team = await Team.findByPk(req.params.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    // Only the creator admin can update the team
    if (team.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Only the team creator can update this team' });
    }

    team.name = req.body.name;
    await team.save();

    res.json(team);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Team name already exists' });
    }
    res.status(500).json({ error: 'Failed to update team' });
  }
};

exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findByPk(req.params.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    // Only the creator admin can delete the team
    if (team.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Only the team creator can delete this team' });
    }

    await team.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete team' });
  }
};