module.exports = (sequelize, DataTypes) => {
  const Team = sequelize.define('Team', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 50]
      }
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    timestamps: true,
    paranoid: true
  });

  Team.associate = (models) => {
    Team.hasMany(models.User, {
      foreignKey: 'teamId',
      as: 'members',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    Team.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    Team.hasMany(models.Project, {
      foreignKey: 'teamId',
      as: 'projects',
      onDelete: 'CASCADE'
    });
  };

  return Team;
};
