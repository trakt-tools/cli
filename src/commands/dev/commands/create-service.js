const { execSync } = require('child_process');
const { Command } = require('commander');
const fs = require('fs');
const inquirer = require('inquirer');
const path = require('path');
const { addScrobblerSync, validateArg } = require('../../../common/common');

const CURRENT_PATH = process.cwd();

const servicesPath = path.resolve(CURRENT_PATH, 'src', 'services');

/**
 * @param {string} name
 */
const generateId = (name) => {
	return name.replace(/\s/g, '-').toLowerCase();
};

/**
 * @param {string} homePage
 */
const generateHostPatterns = (homePage) => {
	return [homePage.replace(/^https?:\/\/(wwww\.)?/, '*://*.').replace(/\/?$/, '/*')];
};

/**
 * @param {string} id
 */
const validateId = (id) => {
	if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(id)) {
		return 'IDs must contain only lowercase letters, numbers or dash (-), and must not begin or end with a dash';
	}

	const servicePath = path.resolve(servicesPath, id);
	if (fs.existsSync(servicePath)) {
		return 'Service already exists or ID is already being used by another service';
	}

	return true;
};

/**
 * @param {Partial<CreateStreamingServiceOptions>} args
 * @returns {Partial<CreateStreamingServiceOptions>}
 */
const parseArgsIntoOptions = (args) => {
	if (Object.keys(args).length === 0) {
		return {};
	}

	return {
		name: args.name ?? '',
		id: args.id ?? (args.name && generateId(args.name)) ?? '',
		homePage: args.homePage ?? '',
		hasScrobbler: args.hasScrobbler ?? false,
		hasSync: args.hasSync ?? false,
		hasAutoSync: args.hasAutoSync ?? false,
	};
};

/**
 * @param {Partial<CreateStreamingServiceOptions>} options
 * @returns {Promise<CreateStreamingServiceOptions>}
 */
const promptForMissingOptions = async (options) => {
	const questions = [];
	if (typeof options.name === 'undefined') {
		questions.push({
			type: 'input',
			name: 'name',
			message: 'Enter the name of the service:',
		});
	}
	if (typeof options.id === 'undefined') {
		questions.push({
			type: 'input',
			name: 'id',
			message: 'Enter a unique ID for the service:',
			default: (/** @type {Record<string, unknown>} */ answers) => {
				return generateId(/** @type {string} */ (answers.name));
			},
			validate: (/** @type {string} */ input) => validateId(input),
		});
	}
	if (typeof options.homePage === 'undefined') {
		questions.push({
			type: 'input',
			name: 'homePage',
			message: 'Enter the URL for the home page of the service:',
		});
	}
	if (typeof options.hasScrobbler === 'undefined') {
		questions.push({
			type: 'confirm',
			name: 'hasScrobbler',
			message: 'Will the service have a scrobbler function?',
			default: false,
		});
	}
	if (typeof options.hasSync === 'undefined') {
		questions.push({
			type: 'confirm',
			name: 'hasSync',
			message: 'Will the service have a sync function?',
			default: false,
		});
	}
	if (typeof options.hasAutoSync === 'undefined') {
		questions.push({
			type: 'confirm',
			name: 'hasAutoSync',
			message: 'Will the service have an auto sync function?',
			default: false,
		});
	}

	/** @type {CreateStreamingServiceOptions} */
	const answers = await inquirer.prompt(questions);

	return {
		name: options.name ?? answers.name,
		id: options.id ?? answers.id,
		homePage: options.homePage ?? answers.homePage,
		hasScrobbler: options.hasScrobbler ?? answers.hasScrobbler,
		hasSync: options.hasSync ?? answers.hasSync,
		hasAutoSync: options.hasAutoSync ?? answers.hasAutoSync,
	};
};

/**
 * @param {Partial<CreateStreamingServiceOptions>} args
 */
const createService = async (args) => {
	if (!fs.existsSync(servicesPath)) {
		console.error(
			'error: This command must be called from the Universal Trakt Scrobbler folder (could not find "src/services")'
		);
		return;
	}

	let options = /** @type {CreateStreamingServiceOptions} */ ({});
	options = {
		...options,
		...parseArgsIntoOptions(args),
	};
	options = await promptForMissingOptions(options);
	if (!/^https?:\/\//.test(options.homePage)) {
		options.homePage = `https://${options.homePage}`;
	}
	if (options.hasAutoSync && !options.hasSync) {
		options.hasSync = true;
	}

	const service = {
		id: options.id,
		name: options.name,
		homePage: options.homePage,
		hostPatterns: generateHostPatterns(options.homePage),
		hasScrobbler: options.hasScrobbler,
		hasSync: options.hasSync,
		hasAutoSync: options.hasAutoSync,
	};

	const servicePath = path.resolve(servicesPath, service.id);
	fs.mkdirSync(servicePath);
	addScrobblerSync(servicePath, service);

	try {
		execSync(`npx prettier --loglevel silent --write "${servicePath}"`).toString().trim();
	} catch (err) {
		console.error('error: Failed to run Prettier');
		return;
	}

	console.log('Service created with success at:', servicePath);
};

const createServiceCommand = new Command('create-service');
createServiceCommand.description('Create a new streaming service');

createServiceCommand
	.option('-n, --name <name>', 'The name of the service')
	.option(
		'-i, --id <id>',
		'A unique ID for the service (automatically generated based on the name if not provided)',
		validateArg(validateId)
	)
	.option('-h, --home-page <home-page>', 'The URL for the home page of the service')
	.option('-a, --has-scrobbler', 'If the service will have a scrobbler function')
	.option('-b, --has-sync', 'If the service will have a sync function')
	.option('-c, --has-auto-sync', 'If the service will have an auto sync function');

createServiceCommand.action(createService);

module.exports = createServiceCommand;
