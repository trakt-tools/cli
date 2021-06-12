const { Command } = require('commander');
const packageJson = require('../package.json');
const devCommand = require('./commands/dev/dev');

const cli = () => {
	const program = new Command('trakt-tools');
	program.version(packageJson.version);
	program.description(packageJson.description);

	program.addCommand(devCommand);

	program.parseAsync();
};

module.exports = cli;
