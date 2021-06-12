const { InvalidOptionArgumentError } = require('commander');
const fs = require('fs');
const path = require('path');

const BASE_PATH = __dirname;

const templatesPath = path.resolve(BASE_PATH, '..', 'templates');

/**
 * @param {string} servicePath
 * @param {StreamingService} service
 */
const addScrobblerSync = (servicePath, service) => {
	let apiTemplate = '';
	let scrobblerApiTemplate = '';
	let syncApiTemplate = '';
	if (service.hasScrobbler) {
		scrobblerApiTemplate = fs.readFileSync(
			path.resolve(templatesPath, 'scrobbler-template', 'ScrobblerTemplateApi.ts'),
			'utf-8'
		);
	}
	if (service.hasSync) {
		syncApiTemplate = fs.readFileSync(
			path.resolve(templatesPath, 'sync-template', 'SyncTemplateApi.ts'),
			'utf-8'
		);
	}
	if (scrobblerApiTemplate && syncApiTemplate) {
		apiTemplate = applyFragments(scrobblerApiTemplate, syncApiTemplate);
	} else {
		apiTemplate = scrobblerApiTemplate || syncApiTemplate;
	}
	if (apiTemplate) {
		const serviceKey = generateKey(service.id);

		apiTemplate = replaceTemplate(apiTemplate, service.id, serviceKey);
		fs.writeFileSync(path.resolve(servicePath, `${serviceKey}Api.ts`), apiTemplate);

		if (service.hasScrobbler) {
			let eventsTemplate = fs.readFileSync(
				path.resolve(templatesPath, 'scrobbler-template', 'ScrobblerTemplateEvents.ts'),
				'utf-8'
			);
			eventsTemplate = replaceTemplate(eventsTemplate, service.id, serviceKey);
			fs.writeFileSync(path.resolve(servicePath, `${serviceKey}Events.ts`), eventsTemplate);

			let parserTemplate = fs.readFileSync(
				path.resolve(templatesPath, 'scrobbler-template', 'ScrobblerTemplateParser.ts'),
				'utf-8'
			);
			parserTemplate = replaceTemplate(parserTemplate, service.id, serviceKey);
			fs.writeFileSync(path.resolve(servicePath, `${serviceKey}Parser.ts`), parserTemplate);
		}
	}
};

/**
 * @param {string} srcTemplate
 * @param {string} destTemplate
 */
const applyFragments = (srcTemplate, destTemplate) => {
	const fragments = srcTemplate.match(/^\t*\/\/\sfragment\s.+?\s.+?\n.+?^\t*\/\/\sfragment\n/gms);
	if (fragments) {
		for (const fragment of fragments) {
			const fragmentMatches = fragment.match(
				/^\t*\/\/\sfragment\s(.+?)\s(.+?)\n(.+?)^\t*\/\/\sfragment\n/ms
			);
			const [, searchStr, replaceStr, fragmentStr] = fragmentMatches ?? [];
			if (fragmentMatches && searchStr && replaceStr && fragmentStr) {
				const searchRegex = new RegExp(searchStr, 'm');
				destTemplate = destTemplate.replace(
					searchRegex,
					replaceStr.replace(/\\n/g, '\n').replace(/\\s/g, ' ').replace('%str%', fragmentStr)
				);
			}
		}
	}
	return destTemplate;
};

/**
 * @param {string} id
 */
const generateKey = (id) => {
	return id
		.split('-')
		.map((word) => `${word[0].toUpperCase()}${word.slice(1)}`)
		.join('');
};

/**
 * @param {string} template
 * @param {string} serviceId
 * @param {string} serviceKey
 */
const replaceTemplate = (template, serviceId, serviceKey) => {
	return template
		.replace(/^\t*\/\/\s@ts-expect-error\n/gm, '')
		.replace(/^\t*\/\/\sfragment.*\n/gm, '')
		.replace(/(scrobbler-)?(sync-)?template/g, serviceId)
		.replace(/(Scrobbler)?(Sync)?Template/g, serviceKey);
};

/**
 * @param {string} servicePath
 * @param {StreamingService} service
 * @param {UpdateStreamingServiceOptions} updateOptions
 */
const updateScrobblerSync = (servicePath, service, updateOptions) => {
	if (!service.hasScrobbler && !service.hasSync) {
		service.hasScrobbler = updateOptions.addScrobbler;
		service.hasSync = updateOptions.addSync;
		addScrobblerSync(servicePath, service);
		return;
	}

	let apiTemplate = '';
	if (service.hasScrobbler) {
		apiTemplate = fs.readFileSync(
			path.resolve(templatesPath, 'sync-template', 'SyncTemplateApi.ts'),
			'utf-8'
		);
	} else if (service.hasSync) {
		apiTemplate = fs.readFileSync(
			path.resolve(templatesPath, 'scrobbler-template', 'ScrobblerTemplateApi.ts'),
			'utf-8'
		);
	}
	if (apiTemplate) {
		const serviceKey = generateKey(service.id);

		const api = fs.readFileSync(path.resolve(servicePath, `${serviceKey}Api.ts`), 'utf-8');
		apiTemplate = applyFragments(apiTemplate, api);
		apiTemplate = replaceTemplate(apiTemplate, service.id, serviceKey);
		fs.writeFileSync(path.resolve(servicePath, `${serviceKey}Api.ts`), apiTemplate);

		if (updateOptions.addScrobbler) {
			let eventsTemplate = fs.readFileSync(
				path.resolve(templatesPath, 'scrobbler-template', 'ScrobblerTemplateEvents.ts'),
				'utf-8'
			);
			eventsTemplate = replaceTemplate(eventsTemplate, service.id, serviceKey);
			fs.writeFileSync(path.resolve(servicePath, `${serviceKey}Events.ts`), eventsTemplate);

			let parserTemplate = fs.readFileSync(
				path.resolve(templatesPath, 'scrobbler-template', 'ScrobblerTemplateParser.ts'),
				'utf-8'
			);
			parserTemplate = replaceTemplate(parserTemplate, service.id, serviceKey);
			fs.writeFileSync(path.resolve(servicePath, `${serviceKey}Parser.ts`), parserTemplate);
		}
	}
};

/**
 * @param {(value: string) => boolean | string} validator
 */
const validateArg = (validator) => {
	return (/** @type {string} */ value) => {
		const result = validator(value);
		if (typeof result === 'string') {
			throw new InvalidOptionArgumentError(result);
		}
		return value;
	};
};

module.exports = {
	addScrobblerSync,
	applyFragments,
	generateKey,
	replaceTemplate,
	updateScrobblerSync,
	validateArg,
};
