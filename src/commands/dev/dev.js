const { Command } = require('commander');
const createServiceCommand = require('./commands/create-service');
const updateServiceCommand = require('./commands/update-service');

const devCommand = new Command('dev');
devCommand.description('Helper tools for development');

devCommand.addCommand(createServiceCommand);
devCommand.addCommand(updateServiceCommand);

module.exports = devCommand;
