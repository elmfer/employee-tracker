// Purpose: Contains all the actions that can be taken by the user

const { Department, Role, Employee } = require('./model');
const inquirer = require('inquirer');
const { decrement } = require('./model/department');
const loading = require('loading-cli');

// Validate that a string is a number
function isNumerical(str){
  const num = Number(str);

  return Number.isNaN(num) ? "Enter a number" : true;
}

// Display an array of objects as a table
function showTable(array) {
  // Encase anything that isn't an array in an array
  if(!Array.isArray(array))
    array = [array];

  // Convert array to object (removes duplicate id columns)
  const arrayAsObj = array.reduce((obj, {id, ...x}) => { obj[id] = x; return obj; }, {});

  // Display table
  console.table(arrayAsObj);
}

// Asks the user for a new department name and returns the name
function promptNewDepartment() {
  const question = [{
    name: 'name',
    type: 'input',
    message: "New Department Name"
  }];

  return inquirer.prompt(question).then((answers) => {return { name: answers.name }} );
}

// Asks the user for a new role with a title, salary, and department
// Returns an object with the title, salary, and department_id
async function promptNewRole() {
  // Get all departments from the database and display them as a list
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

  // Assign department_id from the user's choice
  newRole.department_id = Number(newRole.department_id.split('.')[0]);

  return newRole;
}

// Asks the user for a new employee with a first name, last name, role, and manager
// Returns an object with the first name, last name, role_id, and manager_id
async function promptNewEmployee() {
  // Get all roles from the database and display them as a list
  const loadRoles = loading("Loading Available Roles").start();
  const roles = await Role.findAll({raw: true});
  loadRoles.stop();

  // Get all managers from the database and display them as a list
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

  // Assign role_id from the user's choice
  newEmployee.role_id = Number(newEmployee.role_id.split('.')[0]);

  // If user chose "none" for manager, set manager_id to null
  if(newEmployee.manager_id === "none") newEmployee.manager_id = null;
  // Otherwise, assign manager_id from the user's choice
  else newEmployee.manager_id = Number(newEmployee.manager_id.split('.')[0]);

  return newEmployee;
}

// Asks the user for an employee and a new role for that employee
async function promptEmployeeRoleChange() {
  // Get all roles from the database and display them as a list
  const loadRoles = loading("Loading Available Roles").start();
  const roles = await Role.findAll({raw: true});
  loadRoles.stop();

  // Get all employees from the database and display them as a list
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
  // Get manager id from the user's choice
  inquiry.id = Number(inquiry.id.split('.')[0]);
  // Get role id from the user's choice
  inquiry.role = Number(inquiry.role.split('.')[0]);

  return inquiry;
}

// Actions that can be taken by the user
// Each action is a function that returns true if the loop should exit
const Actions = {
  "View Departments": async function() {
    // Get all departments from the database
    const load = loading("Loading Departments").start();
    const departments = await Department.findAll({ raw: true });
    load.stop();

    showTable(departments);
    return false;
  },
  "View Roles": async function() {
    // Get all roles from the database
    const load = loading("Loading Roles").start();
    const roles = await Role.findAll({ raw: true });
    load.stop();

    showTable(roles);
    return false;
  },
  "View Employees": async function() {
    // Get all employees from the database
    const load = loading("Loading Employess").start();
    const employees = await Employee.findAll({ raw: true });
    load.stop();

    showTable(employees);
    return false;
  },
  "Add Department": async function() {
    // Ask the user for a new department name
    const newDepartment = await promptNewDepartment();

    // Add the new department to the database
    const load = loading("Adding Department").start();
    const department = await Department.create(newDepartment);
    load.stop();

    // Display the new department result
    showTable(department.dataValues);
    return false;
  },
  "Add Role": async function() {
    // Ask the user for a new role
    const newRole = await promptNewRole();

    // Add the new role to the database
    const load = loading("Adding Role").start();
    const role = await Role.create(newRole);
    load.stop();

    // Display the new role result
    showTable(role.dataValues);
    return false;
  },
  "Add Employee": async function() {
    // Ask the user for a new employee
    const newEmployee = await promptNewEmployee();

    // Add the new employee to the database
    const load = loading("Adding Employee").start();
    const employee = await Employee.create(newEmployee);
    load.stop();

    // Display the new employee result
    showTable(employee.dataValues);
    return false;
  },
  "Change Employee Role": async function() {
    // Ask the user for an employee and a new role for that employee
    const inquiry = await promptEmployeeRoleChange();

    // Get employee from the database
    const loadEmployee = loading("Loading Employee").start();
    const employee = await Employee.findByPk(inquiry.id);
    loadEmployee.stop();

    // Update employee's role
    const updateEmployee = loading("Updating Employee").start();
    employee.role_id = Number(inquiry.role);
    await employee.save();
    updateEmployee.stop();

    // Display the updated employee result
    showTable(employee.dataValues);
    return false;
  },
  "Quit": async function() {
    console.log("Bye!");

    // Return true to exit the loop
    return true;
  },
  // Utility function to get a list of all actions
  getActions: function() {
    const list = Object.entries(this).map((entry) => {
      return entry[0];
    });
    list.pop();
    return list;
  }
};

module.exports = Actions;