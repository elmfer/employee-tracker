const { Model , DataTypes } = require('sequelize');

class Employee extends Model {};

Employee.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    first_name: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'role',
        key: 'id'
      }
    },
    manager_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'employee',
        key: 'id'
      }
    }
  },
  {
    sequelize,
    timestamps: false,
    underscored: true,
    modelName: 'employee'
  }
);

module.exports = Employee;