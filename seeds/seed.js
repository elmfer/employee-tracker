const sequelize = require('../config/connection');
const { Department, Role, Employee } = require('../model');

const departmentSeeds = require('./departments.json');
const roleSeeds = require('./roles.json')

function randInt(max) {
  return Math.floor(Math.random() * max);
}

function genEmployeeSeeds(numEmployees) {
  return fetch(`https://randomuser.me/api/?results=${numEmployees}`, {
    headers: {
      "Content-Type": "application/json"
    }
  }).then((response) => { return response.json(); })
  .then((result) => {
    const people = result.results;

    let i = 1;
    const employees = people.map((person) => {
      return { id: i++, first_name: person.name.first, last_name: person.name.last }
    });

    return employees;
  });
}

async function assignRoles(employees, roles) {
  const ceo = employees[randInt(employees.length)];
  ceo.role_id = 8;

  for(const employee of employees) {
    if(employee === ceo) continue;

    while(true) {
      const role = roles[randInt(roles.length)];
      if(role.title === "CEO") continue;

      employee.role_id = role.id;
      break;
    }
  }
}

async function assignManagers(employees) {
  const managers = employees.filter((employee) => employee.role_id === 8);
  const employeePool = [...employees];

  for(let i = 0; i < employees.length / 6; i++) {
    let randIndex = randInt(employeePool.length);
    managers.push(employeePool[randIndex]);
    employeePool.splice(randIndex, 1);
  }
  const subordinates = employeePool;

  for(const subordinate of subordinates) {
    subordinate.manager_id = managers[randInt(managers.length)].id;
  }
}

const seedDatabase = async () => {
  await sequelize.sync({ force: true });

  const departments = await Department.bulkCreate(departmentSeeds, {
    returning: true,
  });

  for(let role of roleSeeds) {
    role.salary = 40000 + Math.random() * 40000;
  }

  const roles = await Role.bulkCreate(roleSeeds, {
    returning: true
  });

  const employeeSeeds = await genEmployeeSeeds(20);
  assignRoles(employeeSeeds, roles);
  
  const employees = await Employee.bulkCreate(employeeSeeds);
  assignManagers(employeeSeeds);
  await Employee.bulkCreate(employeeSeeds, { updateOnDuplicate: ["manager_id"]});

  process.exit(0);
};

seedDatabase();
