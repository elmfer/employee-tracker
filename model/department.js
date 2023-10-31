const { Model, DataTypes } = require('sequelize');

class Department extends Model {};

Department.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(30),
      allowNull: false
    }
  },
  {
    sequelize,
    timestamps: false,
    underscored: true,
    modelName: 'department'
  }
);

module.exports = Department;