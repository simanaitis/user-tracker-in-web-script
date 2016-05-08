module.exports = (function Const() {

	var BASE,
		KEY = 'userTracking',
		VISITKEY = 'SessionId';

    if (location.host.indexOf('localhost') !== -1) {
        BASE = 'http://localhost:3000/api/';
    } else if (location.host.indexOf('herokuapp') !== -1) {
        BASE = '';
    }

	return {
		SESSION_STOPPED: 'doNothing',
		SESSION_FAILED: 'failed',
		SESSION_NAME: 'userTracking',

		SESSION_TIME: 60 * 1000,
		INTERVAL_TIME: 20000,
		MAX_ALLOWED_SIZE: 10,

		KEY: KEY,
		VISITKEY:VISITKEY,
		REGEXP: new RegExp('(?:(?:^|.*;s*)' + KEY + 's*=s*([^;]*).*$)|^.*$'),

		BASE: BASE
	};
})();