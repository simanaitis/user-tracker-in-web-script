module.exports = (function CookieManager() {

    var createCookie = function(name, value, ms) {
        var expires = '';
        if (ms) {
            var date = new Date();
            date.setTime(date.getTime() + (ms * 1000));
            expires = '; expires=' + date.toGMTString();
        } else {
            expires = '';
        }
        document.cookie = name + '=' + value + expires + '; path=/';
    };

    var readCookie = function(name) {
        var nameEQ = name + '=';
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1, c.length);
            }
            if (c.indexOf(nameEQ) === 0) {
                return c.substring(nameEQ.length, c.length);
            }
        }
        return null;
    };

    var eraseCookie = function(name) {
        createCookie(name, '', -1);
    };

    return {
        createCookie: createCookie,
        readCookie: readCookie,
        eraseCookie: eraseCookie
    };
})();