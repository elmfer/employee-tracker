const { Department, Role, Employee } = require('./model');
const inquirer = require('inquirer');
const { decrement } = require('./model/department');
const loading = require('loading-cli');

function isNumerical(str){
  const num = Number(str);

  return Number.isNaN(num) ? "Enter a number" : true;
}

function showTable(array) {
  if(!Array.isArray(array))
    array = [array];

  const arrayAsObj = array.reduce((obj, {id, ...x}) => { obj[id] = x; return obj; }, {});

  console.table(arrayAsObj);
}

function promptNewDepartment() {
  const question = [{
    name: 'name',
    type: 'input',
    message: "New Department Name"
  }];

  return inquirer.prompt(question).then((answers) => {return { name: answers.name }} );
}

async function promptNewRole() {
  const load = loading("Loading Available Departments").start();
  const departments = await Department.findAll({ raw: true });
  load.stop();

  const questions = [
    {
      name: 'title',
      type: 'input',
      message: "New Role Title"
    },
    {
      name: 'salary',
      type: 'input',
      message: 'Role Salary',
      validate: isNumerical
    },
    {
      name: 'department_id',
      type: 'list',
      message: 'Select Department',
      choices: departments.map((dep) => { return `${dep.id}. ${dep.name}`; })
    }
  ];

  const newRole = await inquirer.prompt(questions);
  newRole.department_id = Number(newRole.department_id.split('.')[0]);

  return newRole;
}

async function promptNewEmployee() {
  const loadRoles = loading("Loading Available Roles").start();
  const roles = await Role.findAll({raw: true});
  loadRoles.stop();

  const loadManagers = loading("Loading Managers").start();
  const managers = await Employee.findAll({ where: { manager_id: null }, raw: true});
  const managerChoices = managers.map((manager) => { return `${manager.id}. ${manager.first_name} ${manager.last_name}`; });
  managerChoices.unshift("none");
  loadManagers.stop();

  const questions = [
    {
      name: 'first_name',
      type: 'input',
      message: "First Name"
    },
    {
      name: 'last_name',
      type: 'input',
      message: "Last Name"
    },
    {
      name: 'role_id',
      type: 'list',
      message: "Select Role",
      choices: roles.map((role) => { return `${role.id}. ${role.title}`; })
    },
    {
      name: 'manager_id',
      type: 'list',
      message: "Select Manager",
      choices: managerChoices
    }
  ];

  const newEmployee = await inquirer.prompt(questions);
  newEmployee.role_id = Number(newEmployee.role_id.split('.')[0]);

  if(newEmployee.manager_id === "none") newEmployee.manager_id = null;
  else newEmployee.manager_id = Number(newEmployee.manager_id.split('.')[0]);

  return newEmployee;
}

async function promptEmployeeRoleChange() {
  const loadRoles = loading("Loading Available Roles").start();
  const roles = await Role.findAll({raw: true});
  loadRoles.stop();

  const loadEmployees = loading("Loading Employees").start();
  const employees = await Employee.findAll({raw: true});
  loadEmployees.stop();

  const questions = [
    {
      name: 'id',
      type: 'list',
      message: "Select Employee",
      choices: employees.map((employee) => { return `${employee.id}. ${employee.first_name} ${employee.last_name}`; })
    },
    {
      name: 'role',
      type: 'list',
      message: "Select New Role",
      choices: roles.map((role) => { return `${role.id}. ${role.title}`; })
    }
  ];

  const inquiry = await inquirer.prompt(questions);
  inquiry.id = Number(inquiry.id.split('.')[0]);
  inquiry.role = Number(inquiry.role.split('.')[0]);

  return inquiry;
}

const Actions = {
  "View Departments": async function() {
    const load = loading("Loading Departments").start();
    const departments = await Department.findAll({ raw: true });
    load.stop();

    showTable(departments);
    return false;
  },
  "View Roles": async function() {
    const load = loading("Loading Roles").start();
    const roles = await Role.findAll({ raw: true });
    load.stop();

    showTable(roles);
    return false;
  },
  "View Employees": async function() {
    const load = loading("Loading Employess").start();
    const employees = await Employee.findAll({ raw: true });
    load.stop();

    showTable(employees);
    return false;
  },
  "Add Department": async function() {
    const newDepartment = await promptNewDepartment();

    const load = loading("Adding Department").start();
    const department = await Department.create(newDepartment);
    load.stop();

    showTable(department.dataValues);
    return false;
  },
  "Add Role": async function() {
    const newRole = await promptNewRole();

    const load = loading("Adding Role").start();
    const role = await Role.create(newRole);
    load.stop();

    showTable(role.dataValues);
    return false;
  },
  "Add Employee": async function() {
    const newEmployee = await promptNewEmployee();

    const load = loading("Adding Employee").start();
    const employee = await Employee.create(newEmployee);
    load.stop();

    showTable(employee.dataValues);
    return false;
  },
  "Change Employee Role": async function() {
    const inquiry = await promptEmployeeRoleChange();

    const loadEmployee = loading("Loading Employee").start();
    const employee = await Employee.findByPk(inquiry.id);
    loadEmployee.stop();

    const updateEmployee = loading("Updating Employee").start();
    employee.role_id = Number(inquiry.role);
    await employee.save();
    updateEmployee.stop();

    showTable(employee.dataValues);
    return false;
  },
  "Quit": async function() {
    console.log("Bye!");
    return true;
  },
  getActions: function() {
    const list = Object.entries(this).map((entry) => {
      return entry[0];
    });
    list.pop();
    return list;
  }
};

module.exports = Actions;