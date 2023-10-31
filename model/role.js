const { Model, DataTypes } = require('sequelize');

class Role extends Model {};

Role.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    salary: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    department_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'department',
        key: 'id'
      }
    }
  },
  {
    sequelize,
    timestamps: false,
    underscored: true,
    modelName: 'role'
  }
);

module.exports = Role;