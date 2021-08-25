const { Command } = require('commander');
const createServiceCommand = require('./commands/create-service');
const updateReadmeCommand = require('./commands/update-readme');
const updateServiceCommand = require('./commands/update-service');

const devCommand = new Command('dev');
devCommand.description('Helper tools for development');

devCommand.addCommand(createServiceCommand);
devCommand.addCommand(updateServiceCommand);
devCommand.addCommand(updateReadmeCommand);

module.exports = devCommand;
