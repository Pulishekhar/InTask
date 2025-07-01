module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: DataTypes.TEXT,
    status: {
      type: DataTypes.ENUM('todo', 'inProgress', 'done', 'inReview'),
      defaultValue: 'todo'
    },
    priority: {
      type: DataTypes.ENUM('Low', 'Medium', 'High'),
      defaultValue: 'Medium'
    },
    dueDate: DataTypes.DATE,
    submittedOn: DataTypes.DATE,
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'Users', key: 'id' }
    }
  }, {
    paranoid: true
  });

  Project.associate = (models) => {
    Project.belongsTo(models.Team, {
      foreignKey: 'teamId',
      allowNull: true,
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    Project.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator',
      allowNull: true,
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    Project.hasMany(models.Task, {
      foreignKey: 'projectId',
      as: 'tasks',
      onDelete: 'CASCADE'
    });
  };

  return Project;
};
