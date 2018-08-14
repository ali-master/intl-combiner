module.exports = function(yargs) {
	yargs
		.help("help")
		.alias("help", "h")
		.version()
		.alias("version", "v")
		.options({
			context: {
				type: "string",
				alias: "C",
				describe:
					"The base directory, an absolute path, for resolving entry points and loaders from configuration.",
				requiresArg: true
			},
			locale: {
				type: "array",
				alias: "l",
				describe: "The list of Locales paths and names",
				requiresArg: true
			},
			"diff-path": {
				type: "string",
				alias: "d",
				describe: "Path to save diff file after generating.",
				requiresArg: true
			},
			messages: {
				type: "string",
				alias: "m",
				describe:
					"Path to the messages files. this string inlcudes glob model",
				requiresArg: true
			},
			findBy: {
				type: "string",
				alias: "f",
				describe:
					"The goal locale name which does you want to find differences and merge diffs to that.",
				defaultDescription: "en or fr",
				requiresArg: true
			}
		});
};
