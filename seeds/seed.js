// Purpose: Seed the database with about 20 employees, 6 managers, 3 departments, and 8 roles.

const sequelize = require('../config/connection');
const { Department, Role, Employee } = require('../model');

const departmentSeeds = require('./departments.json');
const roleSeeds = require('./roles.json')

// Random integer from 0 to max - 1
function randInt(max) {
  return Math.floor(Math.random() * max);
}

// Generate employee seeds using the randomuser.me API
function genEmployeeSeeds(numEmployees) {
  return fetch(`https://randomuser.me/api/?results=${numEmployees}`, {
    headers: {
      "Content-Type": "application/json"
    }
  }).then((response) => { return response.json(); })
  .then((result) => {
    const people = result.results;

    // Map people to employees
    let i = 1;
    const employees = people.map((person) => {
      return { id: i++, first_name: person.name.first, last_name: person.name.last }
    });

    return employees;
  });
}

// Assign roles to employees
async function assignRoles(employees, roles) {
  // Assign CEO
  const ceo = employees[randInt(employees.length)];
  ceo.role_id = 8;

  for(const employee of employees) {
    // Skip CEO
    if(employee === ceo) continue;

    // Assign random role
    while(true) {
      const role = roles[randInt(roles.length)];
      if(role.title === "CEO") continue;

      employee.role_id = role.id;
      break;
    }
  }
}

// Assign managers to employees
async function assignManagers(employees) {
  // Create empty manager pool with the CEO in it
  const managers = employees.filter((employee) => employee.role_id === 8);

  // Create employee pool
  const employeePool = [...employees];

  // Choose 6 employees to be managers
  for(let i = 0; i < employees.length / 6; i++) {
    let randIndex = randInt(employeePool.length);
    managers.push(employeePool[randIndex]);
    employeePool.splice(randIndex, 1);
  }
  const subordinates = employeePool;

  // Assign managers to subordinates
  for(const subordinate of subordinates) {
    subordinate.manager_id = managers[randInt(managers.length)].id;
  }
}

// Seed the database
const seedDatabase = async () => {
  // Establish connection to database
  await sequelize.sync({ force: true });

  // Create departments from the department.json file into the database
  const departments = await Department.bulkCreate(departmentSeeds, {
    returning: true,
  });

  // Assign salaries to roles
  for(let role of roleSeeds) {
    role.salary = 40000 + Math.random() * 40000;
  }

  // Create roles from the roles.json file with salaries into the database
  const roles = await Role.bulkCreate(roleSeeds, {
    returning: true
  });

  // Generate employee seeds
  const employeeSeeds = await genEmployeeSeeds(20);
  assignRoles(employeeSeeds, roles); // And assign roles to them
  
  // Create employees from the employeeSeeds array into the database
  const employees = await Employee.bulkCreate(employeeSeeds);

  // Lastly, assign managers to employees
  assignManagers(employeeSeeds);
  await Employee.bulkCreate(employeeSeeds, { updateOnDuplicate: ["manager_id"]});

  process.exit(0);
};

seedDatabase();
