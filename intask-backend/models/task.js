module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true, len: [3, 100] }
    },
    description: {
      type: DataTypes.TEXT,
      validate: { len: [0, 2000] }
    },
    status: {
      type: DataTypes.ENUM('todo', 'inProgress', 'done'),
      defaultValue: 'todo'
    },
    dueDate: {
      type: DataTypes.DATE,
      validate: { isDate: true }
    }
  }, {
    paranoid: true,
    indexes: [
      { fields: ['projectId'] },
      { fields: ['assignedTo'] }
    ]
  });

  Task.associate = (models) => {
    Task.belongsTo(models.Project, {
      foreignKey: { name: 'projectId', allowNull: false },
      as: 'project',
      onDelete: 'CASCADE'
    });

    Task.belongsTo(models.User, {
      foreignKey: { name: 'assignedTo', allowNull: true },
      as: 'assignee',
      onDelete: 'SET NULL'
    });
  };

  return Task;
};
