const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User } = require('../models');
require('dotenv').config();

/**
 * Enhanced Authentication Middleware
 * - Verifies JWT token
 * - Attaches user details to request
 * - Handles token expiration gracefully
 */
exports.protect = async (req, res, next) => {
  try {
    // Check for token in headers or cookies
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      console.warn('⛔ No token provided');
      return res.status(401).json({
        status: 'error',
        code: 'NO_TOKEN_PROVIDED',
        message: 'Authorization token required',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const currentUser = await User.findByPk(decoded.id, {
      attributes: ['id', 'role', 'teamId', 'email', 'name'],
    });

    if (!currentUser) {
      console.warn('⚠️ Token valid but user no longer exists');
      return res.status(401).json({
        status: 'error',
        code: 'USER_NOT_FOUND',
        message: 'The user belonging to this token no longer exists',
      });
    }

    // Check if user changed password after token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      console.warn('⚠️ Password changed after token issued');
      return res.status(401).json({
        status: 'error',
        code: 'PASSWORD_CHANGED',
        message: 'User recently changed password. Please log in again.',
      });
    }

    // Attach user to request
    req.user = currentUser;
    res.locals.user = currentUser;

    console.log(`✅ Authenticated ${currentUser.role} user: ${currentUser.email}`);
    return next();
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);

    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        code: 'TOKEN_EXPIRED',
        message: 'Session expired. Please login again.',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        code: 'INVALID_TOKEN',
        message: 'Invalid authentication token',
      });
    }

    // Generic error handler
    return res.status(401).json({
      status: 'error',
      code: 'AUTHENTICATION_FAILED',
      message: 'Authentication failed',
    });
  }
};

/**
 * Role-Based Access Control Middleware
 * - Restricts access to specific roles
 * - Can be used after protect middleware
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      console.warn(
        `⛔ Forbidden access: ${req.user.role} trying to access ${roles} restricted route`
      );
      return res.status(403).json({
        status: 'error',
        code: 'FORBIDDEN',
        message: 'You do not have permission to perform this action',
        requiredRoles: roles,
        yourRole: req.user.role,
      });
    }
    next();
  };
};

/**
 * Team Ownership Check Middleware
 * - Verifies if user belongs to the team they're trying to access
 */
exports.checkTeamOwnership = async (req, res, next) => {
  try {
    // Skip for admins
    if (req.user.role === 'admin') return next();

    const requestedTeamId = req.params.teamId || req.body.teamId;

    if (!requestedTeamId) {
      return res.status(400).json({
        status: 'error',
        message: 'Team ID is required',
      });
    }

    if (req.user.teamId !== parseInt(requestedTeamId)) {
      console.warn(
        `⛔ User ${req.user.id} attempted to access team ${requestedTeamId} (belongs to ${req.user.teamId})`
      );
      return res.status(403).json({
        status: 'error',
        message: 'You do not have access to this team',
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional Authentication Middleware
 * - Similar to protect but continues if no token is provided
 * - Useful for public routes that have optional auth features
 */
exports.optionalAuth = async (req, res, next) => {
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findByPk(decoded.id, {
        attributes: ['id', 'role', 'teamId', 'email', 'name'],
      });
    }
    next();
  } catch (error) {
    // Continue even if token is invalid (optional auth)
    next();
  }
};