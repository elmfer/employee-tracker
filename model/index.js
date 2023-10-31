const Department = require('./department');
const Role = require('./role');
const Employee = require('./employee');

Department.hasMany(Role, {
  foreignKey: "department_id"
});

Role.hasMany(Employee, {
  foreignKey: "role_id"
});

module.exports = { Department, Role, Employee };