'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Teams', 'createdBy', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Teams', 'createdBy', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  }
};
