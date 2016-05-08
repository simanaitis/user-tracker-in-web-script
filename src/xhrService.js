module.exports = (function XHRService() {

    var _xhr = function(method, url, data) {

        /*function progressHandler(e) {
            promise.notify(e);
        }*/

            var xhr = new XMLHttpRequest();

            function completeHandler(e) {
                removeHandlers();

                if (e.target.status === 200) {
                    var response;
                    if(e.target.response) {
                        response = JSON.parse(e.target.response);
                    }
                    return response;
                } else {
                    errorHandler(e);
                }
            }

            function errorHandler(e) {
                removeHandlers();

                var data;
                try {
                    data = JSON.parse(e.target.response);
                    data.error.message = ErrorMessageTranslator.formatMessage(data.error.code, data.error.message);
                } catch(err) {
                    if(data && data.error) data.error.message = e.target.status + ': ' + e.target.statusText;
                }
                
                return e;
            }

            function canceledHandler(e) {
                removeHandlers();
                promise.reject('Upload canceled.');
            }

            function removeHandlers() {
                //xhr.upload.removeEventListener('progress', progressHandler);
                xhr.removeEventListener('load', completeHandler);
                xhr.removeEventListener('error', errorHandler);
                xhr.removeEventListener('abort', canceledHandler);
            }


        var promise = new Promise(function (completeHandler, errorHandler) {
            //xhr.upload.addEventListener('progress', progressHandler, false);
            xhr.addEventListener('load', completeHandler, false);
            xhr.addEventListener('error', errorHandler, false);
            xhr.addEventListener('abort', canceledHandler, false);

            try {
                xhr.open(method, url);
            } catch(err) {
                removeHandlers();
                promise.reject(err);
                return promise;
            }

            /*if (RequestHeaders && RequestHeaders.Token) {
                xhr.setRequestHeader('token', RequestHeaders.Token);
            }*/

            if (!(data instanceof FormData)) {
                xhr.setRequestHeader('Content-Type', 'application/json');
                data = JSON.stringify(data);
            }

            xhr.send(data);


        });

        return promise;
    };

    var GET = function(url, data) {
        return _xhr('GET', url, data);
    };

    var POST = function(url, data) {
        return _xhr('POST', url, data);
    };

    var DELETE = function(url, data) {
        return _xhr('DELETE', url, data);
    };

    var PATCH = function(url, data) {
        return _xhr('PATCH', url, data);
    };

    var PUT = function(url, data) {
        return _xhr('PUT', url, data);
    };

    return {
        GET: GET,
        POST: POST,
        PUT: PUT,
        DELETE: DELETE,
        PATCH: PATCH
    };
})();