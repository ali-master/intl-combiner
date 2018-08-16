<h1 align="center">
  Intl combiner
</h1>

<h4 align="center">
  📓 Extract and Combine react-intl messages with together on single locale file.
</h4>

<p align="center">
  <a href="https://github.com/ali-master/intl-combiner">
    <img alt="Build Status" src="https://travis-ci.com/ali-master/intl-combiner.svg?branch=master">
  </a>
</p>

## Description

By utilizing a simple and minimal usage syntax, that requires a flat learning curve, the Intl combiner enables you to effectively manage your messages across multiple languages from within your project. All messages are saving and merging atomically with your locales file for taking a single file of all messages that you have written by using the terminal commands or configuration file in the root.

## Highlights

-   Organize messages & locales
-   Save a diff file of your current messages with base locale file.
-   Find diffs by name and value
-   Lightweight & fast
-   messages written atomically to locales file
-   Simple & minimal usage syntax
-   Update notifications
-   Configurable through `~/.combinerrc.json` & `~/.combinerrc.js` or `~/.combinerrc`

## Contents

-   [Description](#description)
-   [Highlights](#highlights)
-   [Install](#install)
-   [Usage](#usage)
-   [Commands](#commands)
-   [Configuration](#configuration)
-   [Development](#development)
-   [Related](#related)
-   [Team](#team)
-   [License](#license)

## Install

```bash
npm install --global intl-combiner
```

## Usage

```
Usage:
   $ combiner <command> [options]
   $ combiner [options] save --local <name:path> --findBy <findBy>
   $ combiner [options] merge --local <name:path> --diff-path <diff-path>
   $ combiner [options] delete

Example:
   $ combiner save --context ./src/ --locale en:locales/en.js --locale fr:locales/fr.js --findBy en --messages **/messages.js
   $ combiner merge --context ./src/ --locale en:locales/en.js --locale fr:locales/fr.js --findBy en --messages **/messages.js
   $ combiner delete --diff-path ./src/locales/diff.json
   $ combiner save // if you have .combinerrc and you want to save diff messages
   $ combiner merge
   $ combiner save --findBy en // you have .combinerrc file, but you want to change the findBy value by terminal

For more information, see https://github.com/ali-master/intl-combiner.
```

## Commands

Invoking intl combiner without any options(except save or merge command) will save or merge all saved messages grouped into their respective locales.

```
combiner save
// or merge
combiner merge
```

In order to change the findBy value in the configuration, based on their creation config, the `--findBy`/`-f` option can be used.

## Configuration

To configure intl combiner navigate to the `~/.combinerrc.json` & `~/.combinerrc.js` or `~/.combinerrc` file and modify any of the options to match your own preference. To reset back to the default values, simply delete the config file from your home directory.

The following illustrates all the available options with their respective values.

```json
{
	"findBy": "en",
	"context": "./src/",
	"messages": "**/messages.js",
	"diffPath": "locales/diff.json",
	"locales": [
		{
			"name": "en",
			"path": "locales/en.json"
		},
		{
			"name": "fr",
			"path": "locales/fr.json"
		}
	]
}
```

### In Detail

##### `findBy`

-   Type: `String`

Find messages and merging or saving with a locale name that you have written, i.e; `en`
And that is a name of one of your locales file which you have.

##### `context`

-   Type: `String`

The context is an absolute string to the directory that contains the locales files.
The base directory, an absolute path, for resolving locale points and messages from the configuration.
i.g:

```
{
  //...
  context: "~/src"
}
```

If left undefined the home directory ~ will be used and combiner will be set-up under ~/.combinerrc/.

Or if you are using the `.combinerrc.js` file, you can be using that like below:

```
{
  //...
  context: path.resolve(__dirname, 'src')
}
```

##### `messages`

-   Type: `String`

The Path to messages file and its glob path [wikipedia](<https://en.wikipedia.org/wiki/Glob_(programming).
i.g:

```
{
  //...
  messages: "**/messages.js"
}
```

##### `diffPath`

-   Type: `String`
-   Default: `The first locale path in the config file`

The path to save diff messages which it has been built automatically.

##### `locales`

-   Type: `Array<Object>`

An array of objects of active locales which you are using the application.
The `findBy` property value must be equal to path of one of locale which you want to work on it.

### Save messages

To save a new diff file use the `save` command with your options following right after.

If you are using the right configuration file:

```
$ combiner save
```

Else:

```
$ combiner save --context ./src/ --locale en:locales/en.js --locale fr:locales/fr.js --findBy en --messages **/messages.js
```

### Merge diffs

To merge the created diff file use the `merge` command with your options following right after.

If you are using the right configuration file:

```
$ combiner merge
```

Else:

```
$ combiner merge --context ./src/ --locale en:locales/en.js --findBy en --messages **/messages.js
```

### Delete diffs

To delete the created diff file use the `delete` command with diff-path option following right after.

```
$ combiner delete --diff-path ./src/locales/diff.json
```

## Development

For more info on how to contribute to the project:

-   Fork the repository and clone it to your machine
-   Navigate to your local fork: `cd intl-combiner`
-   Install the project dependencies: `npm install` or `yarn install`
-   Lint the code for errors: `npm lint:fix` or `yarn lint:fix`

## Related

-   [chalk](https://github.com/chalk/chalk) - Terminal string styling done right
-   [ramda](https://github.com/ramda/ramda) - Practical functional Javascript

## Team

-   Ali Torki [(@ali-master)](https://github.com/ali-master)

## License

[MIT](https://github.com/ali-master/intl-combiner/blob/master/license.md)
