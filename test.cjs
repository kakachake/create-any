const argv = require("minimist")(process.argv.slice(2), { string: ["a"] });
console.log(argv);
