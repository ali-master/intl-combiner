#!/usr/bin/env node
import program from "yargs";
import { getConfig } from "./config";

import { version } from "../package.json";

const yargs = program.usage(`Intl-combiner ${version}
Usage: intl-combiner [options]
       intl-combiner [options] --local <local> --diff-path <diff-path>
       intl-combiner <command> [options]
For more information, see https://github.com/ali-master/intl-combiner.`);

require("./config-yargs")(yargs);

// yargs will terminate the process early when the user uses help or version.
// This causes large help outputs to be cut short (https://github.com/nodejs/node/wiki/API-changes-between-v0.10-and-v4#process).
// To prevent this we use the yargs.parse API and exit the process normally
yargs.parse(process.argv.slice(2), (err, argv, output) => {
	Error.stackTraceLimit = 30;
	let outputOptions = {
		locale: null,
		config: null,
		context: null,
		diffPath: null,
		messages: null
	};

	// arguments validation failed
	if (err && output) {
		console.error(output);
		process.exitCode = 1;
		return;
	}

	// help or version info
	if (output) {
		console.log(output);
		return;
	}

	const ifArg = (name, fn, init) => {
		if (Array.isArray(argv[name])) {
			if (init) init();
			argv[name].forEach(fn);
		} else if (typeof argv[name] !== "undefined") {
			if (init) init();
			fn(argv[name], -1);
		}
	};

	ifArg("locale", locale => {
		if (locale) {
			outputOptions.locale = locale;
		}
	});

	ifArg("config", config => {
		if (config) {
			outputOptions.config = config;
		}
	});

	ifArg("context", context => {
		if (context) {
			outputOptions.context = context;
		}
	});

	ifArg("diff-path", diffPath => {
		if (diffPath) {
			outputOptions.diffPath = diffPath;
		}
	});

	ifArg("messages", messages => {
		if (messages) {
			outputOptions.messages = messages;
		}
	});

	console.log(outputOptions);
});
