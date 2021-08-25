const { execSync } = require('child_process');
const { Command } = require('commander');
const fs = require('fs');
const path = require('path');
const { generateKey } = require('../../../common/common');

const CURRENT_PATH = process.cwd();

const servicesPath = path.resolve(CURRENT_PATH, 'src', 'services');

const updateReadme = async () => {
	if (!fs.existsSync(servicesPath)) {
		console.error(
			'error: This command must be called from the Universal Trakt Scrobbler folder (could not find "src/streaming-services")'
		);
		return;
	}

	const services = [
		'<!-- services-start -->',
		'<!-- Update this section with `npx trakt-tools dev update-readme` -->',
		'Streaming Service | Scrobble | Sync | Limitations',
		':-: | :-:| :-: | :-',
	];

	const serviceIds = fs.readdirSync(servicesPath).filter((id) => !id.endsWith('.ts'));
	for (const serviceId of serviceIds) {
		const servicePath = path.resolve(servicesPath, serviceId);
		const serviceKey = generateKey(serviceId);
		const serviceFile = fs.readFileSync(
			path.resolve(servicePath, `${serviceKey}Service.ts`),
			'utf-8'
		);
		const serviceMatches = /Service\(([\S\s]+?)\)/m.exec(serviceFile);

		if (!serviceMatches) {
			console.error(`error: Invalid service file for ${serviceId}`);
			return;
		}

		const service = /** @type {StreamingService} */ (
			JSON.parse(
				serviceMatches[1]
					.replace(/\r?\n|\r|\t/g, '')
					.replace(/([{,])(\w+?):/g, '$1"$2":')
					.replace(/'/g, '"')
					.replace(/,([\]}])/g, '$1')
			)
		);

		const scrobble = service.hasScrobbler ? '✔️' : '❌';
		const sync = service.hasSync ? '✔️' : '❌';
		const limitations = service.limitations
			? service.limitations.map((limitation) => `- ${limitation}`).join('<br>')
			: '-';
		services.push(`${service.name} | ${scrobble} | ${sync} | ${limitations}`);
	}

	services.push('<!-- services-end -->');

	const readmePath = path.resolve(CURRENT_PATH, 'README.md');
	let readmeFile = fs.readFileSync(readmePath, 'utf-8');
	readmeFile = readmeFile.replace(
		/<!--\sservices-start\s-->[\S\s]+?<!--\sservices-end\s-->/,
		services.join('\n')
	);
	fs.writeFileSync(readmePath, readmeFile);

	try {
		execSync(`npx prettier --loglevel silent --write "${readmePath}"`).toString().trim();
	} catch (err) {
		console.error('error: Failed to run Prettier');
		return;
	}

	console.log('README updated with success at:', readmePath);
};

const updateReadmeCommand = new Command('update-readme');
updateReadmeCommand.description('Updates the README');

updateReadmeCommand.action(updateReadme);

module.exports = updateReadmeCommand;
