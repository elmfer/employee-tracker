const database = require('./config/connection');
const inquirer = require('inquirer');
const Actions = require('./actions');
const loading = require('loading-cli');

// Display a welcome message
function welcomeUser() {
  console.log("+----------------*****----------------+");
  console.log("|                                     |")
  console.log("|     Welcome to Employee Tracker     |");
  console.log("|                                     |")
  console.log("+----------------*****----------------+");
  console.log("\n\n");
}

// Sync the database to the models
function syncToDatabase() {
  const loadingIndicator = loading("Syncing to database     ").start();

  return database.sync( { force: false } ).then(() => {
    loadingIndicator.stop();
    console.log("Synced to database!\n\n");
  });
}

// Prompt the user for what they want to do
function promptWhatToDo() {
  const question = [{
      message: "What do you want to do?",
      type: "list",
      name: "action",
      choices: Actions.getActions()
  }];

  return inquirer.prompt(question).then((answers) => { return answers.action });
}

// Entry point
async function main() {
  welcomeUser();

  await syncToDatabase();

  // Loop until the user quits
  while(true) {
    const action = await promptWhatToDo();

    // Run the action and check if the user wants to quit
    const shouldQuit = await Actions[action]();

    if(shouldQuit) process.exit(0);
  }
}

main();