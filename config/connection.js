const Sequelize = require('sequelize');
require('dotenv').config();

// Establish connection to database
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
    port: 3306,
  }
);

module.exports = sequelize;