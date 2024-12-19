'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Suppliers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      contact_info: {
        type: Sequelize.JSON,
        allowNull: true, 
      },
      rating: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0.00,
        allowNull: false,
      },
      createdAt: { 
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: { 
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Suppliers');
  },
};
