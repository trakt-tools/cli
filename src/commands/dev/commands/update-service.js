const { Command } = require('commander');
const fs = require('fs');
const inquirer = require('inquirer');
const path = require('path');
const prettier = require('prettier');
const { updateScrobblerSync, validateArg } = require('../../../common/common');

const CURRENT_PATH = process.cwd();

const servicesPath = path.resolve(CURRENT_PATH, 'src', 'streaming-services');
let servicePath = '';
let service = /** @type {StreamingService} */ ({});

/**
 * @param {string} id
 */
const validateId = (id) => {
	servicePath = path.resolve(servicesPath, id);
	if (!fs.existsSync(servicePath)) {
		return 'Service does not exist';
	}

	service = require(path.resolve(servicePath, `${id}.json`));
	if (service.hasScrobbler && service.hasSync) {
		return 'Service already has scrobbler and sync, nothing to update';
	}

	return true;
};

/**
 * @param {Partial<UpdateStreamingServiceOptions>} args
 * @returns {Partial<UpdateStreamingServiceOptions>}
 */
const parseArgsIntoOptions = (args) => {
	if (Object.keys(args).length === 0) {
		return {};
	}

	return {
		id: args.id ?? '',
		addScrobbler: args.addScrobbler ?? false,
		addSync: args.addSync ?? false,
	};
};

/**
 * @param {Partial<UpdateStreamingServiceOptions>} options
 * @returns {Promise<UpdateStreamingServiceOptions>}
 */
const promptForMissingOptions = async (options) => {
	const questions = [];
	if (typeof options.id === 'undefined') {
		questions.push({
			type: 'input',
			name: 'id',
			message: 'Enter the ID of the service to update:',
			validate: (/** @type {string} */ input) => validateId(input),
		});
	}
	if (typeof options.addScrobbler === 'undefined') {
		questions.push({
			type: 'confirm',
			name: 'addScrobbler',
			message: 'Add a scrobbler function to the service?',
			default: false,
			when: () => !service.hasScrobbler,
		});
	}
	if (typeof options.addSync === 'undefined') {
		questions.push({
			type: 'confirm',
			name: 'addSync',
			message: 'Add a sync function to the service?',
			default: false,
			when: () => !service.hasSync,
		});
	}

	/** @type {UpdateStreamingServiceOptions} */
	const answers = await inquirer.prompt(questions);

	return {
		id: options.id ?? answers.id,
		addScrobbler: options.addScrobbler ?? answers.addScrobbler,
		addSync: options.addSync ?? answers.addSync,
	};
};

/**
 * @param {Partial<UpdateStreamingServiceOptions>} args
 */
const updateService = async (args) => {
	if (!fs.existsSync(servicesPath)) {
		console.error(
			'error: This command must be called from the Universal Trakt Scrobbler folder (could not find "src/streaming-services")'
		);
		return;
	}

	let options = /** @type {UpdateStreamingServiceOptions} */ ({});
	options = {
		...options,
		...parseArgsIntoOptions(args),
	};
	options = await promptForMissingOptions(options);

	updateScrobblerSync(servicePath, service, options);

	service.hasScrobbler = service.hasScrobbler || options.addScrobbler;
	service.hasSync = service.hasSync || options.addSync;

	fs.writeFileSync(
		path.resolve(servicePath, `${service.id}.json`),
		prettier.format(JSON.stringify(service), {
			parser: 'json',
			printWidth: 100,
			useTabs: true,
			singleQuote: true,
		})
	);

	console.log('Service updated with success at:', servicePath);
};

const updateServiceCommand = new Command('update-service');
updateServiceCommand.description(
	'Update an existing streaming service (to add a scrobbler/sync function)'
);

updateServiceCommand
	.option('-i, --id <id>', 'The ID of the service to update', validateArg(validateId))
	.option('-a, --add-scrobbler', 'If a scrobbler function will be added to the service')
	.option('-b, --add-sync', 'If a sync function will be added to the service');

updateServiceCommand.action(updateService);

module.exports = updateServiceCommand;
