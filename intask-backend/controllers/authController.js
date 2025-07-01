const { User, Team } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ValidationError, UniqueConstraintError } = require('sequelize');

// JWT generator
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      teamId: user.teamId
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

// Register
const register = async (req, res) => {
  const { name, email, password, role, teamId } = req.body;

  try {
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, password, and role are required'
      });
    }

    let assignedTeamId = teamId;

    // Auto-assign default team if role is 'lead' and no teamId is given
    if (role === 'lead' && !teamId) {
      let defaultTeam = await Team.findOne({ where: { name: 'Unassigned Leads' } });

      if (!defaultTeam) {
        defaultTeam = await Team.create({ name: 'Unassigned Leads' });
        console.log('✅ Default team created');
      }

      assignedTeamId = defaultTeam.id;
    }

    // Validate the assigned team ID exists (after assignment above)
    if (assignedTeamId) {
      const teamExists = await Team.findByPk(assignedTeamId);
      if (!teamExists) {
        return res.status(400).json({
          success: false,
          error: 'Specified team does not exist'
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      teamId: assignedTeamId || null
    });

    const token = generateToken(user);

    let teamName = null;
    if (user.teamId) {
      const team = await Team.findByPk(user.teamId);
      teamName = team?.name || null;
    }

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        teamId: user.teamId,
        teamName
      }
    });

  } catch (err) {
    if (err instanceof UniqueConstraintError || err instanceof ValidationError) {
      const details = err.errors?.map(e => e.message).join(', ') || err.message;
      return res.status(400).json({
        success: false,
        error: details
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const user = await User.scope('withPassword').findOne({
      where: { email },
      include: [{
        model: Team,
        as: 'Team', // required due to alias in User model
        attributes: ['id', 'name']
      }]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    if (user.role !== 'admin' && !user.teamId) {
      return res.status(403).json({
        success: false,
        error: 'Your account is not assigned to a team. Please contact administrator.'
      });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        teamId: user.teamId,
        teamName: user.Team?.name || null
      }
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Verify
const verify = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: Team,
        as: 'Team', // <-- this is the fix!
        attributes: ['id', 'name']
      }]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        teamId: user.teamId,
        teamName: user.Team?.name || null
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

module.exports = {
  register,
  login,
  verify
};
