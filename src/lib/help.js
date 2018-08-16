import { version } from "../../package.json";

export default `Intl-combiner ${version}
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

For more information, see https://github.com/ali-master/intl-combiner.`;
