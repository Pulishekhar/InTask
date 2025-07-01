module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'lead', 'member'),
      defaultValue: 'member'
    },
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Teams',
        key: 'id'
      }
    },
    passwordChangedAt: DataTypes.DATE
  }, {
    paranoid: true,
    defaultScope: {
      attributes: { exclude: ['password'] }
    },
    scopes: {
      withPassword: {
        attributes: {}
      }
    }
  });

  User.associate = (models) => {
    User.belongsTo(models.Team, {
      foreignKey: 'teamId',
      as: 'Team'
    });

    User.hasMany(models.Team, {
      foreignKey: 'createdBy',
      as: 'createdTeams'
    });

    User.hasMany(models.Project, {
      foreignKey: 'createdBy',
      as: 'createdProjects'
    });

    User.hasMany(models.Task, {
      foreignKey: 'assignedTo',
      as: 'assignedTasks'
    });
  };

  // 🛠️ Add this to support token password change check
  User.prototype.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
      const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
      return JWTTimestamp < changedTimestamp;
    }
    return false;
  };

  return User;
};
