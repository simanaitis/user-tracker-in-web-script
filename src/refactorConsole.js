module.exports = (function Console() {

	var log = function() {
		console.log.apply(console, arguments);
	};

	var info = function() {
		console.info ? console.info.apply(console, arguments) : log(arguments);
	};

	var warn = function() {
		console.warn ? console.warn.apply(console, arguments) : log(arguments);
	};

	var error = function() {
		console.error ? console.error.apply(console, arguments) : log(arguments);
	};

	return {
		log: log,
		info: info,
		warn: warn,
		error: error
	}
})();