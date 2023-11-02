const database = require('./config/connection');
const inquirer = require('inquirer');
const Actions = require('./actions');
const loading = require('loading-cli');

function welcomeUser() {
  console.log("+----------------*****----------------+");
  console.log("|                                     |")
  console.log("|     Welcome to Employee Tracker     |");
  console.log("|                                     |")
  console.log("+----------------*****----------------+");
  console.log("\n\n");
}

function syncToDatabase() {
  const loadingIndicator = loading("Syncing to database     ").start();

  return database.sync( { force: false } ).then(() => {
    loadingIndicator.stop();
    console.log("Synced to database!\n\n");
  });
}

function promptWhatToDo() {
  const question = [{
      message: "What do you want to do?",
      type: "list",
      name: "action",
      choices: Actions.getActions()
  }];

  return inquirer.prompt(question).then((answers) => { return answers.action });
}

async function main() {
  welcomeUser();

  await syncToDatabase();

  while(true) {
    const action = await promptWhatToDo();

    const shouldQuit = await Actions[action]();

    if(shouldQuit) process.exit(0);
  }
}

main();