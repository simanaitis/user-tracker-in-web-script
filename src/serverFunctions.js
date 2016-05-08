module.exports = (function ServerFunctions() {
    'use strict';
    var Const = require('./refactorConst.js'),
        CookieManager = require('./cookieManager.js'),
        UserDataManager = require('./userDataManager.js'),
        XHRService = require('./xhrService.js');

    var userModel = UserDataManager.getModel();

    var sendToServer = function(sendingData) {
        var dataToSend = {events: sendingData}
        console.log('sendingToServer');
        console.log(CookieManager.readCookie(Const.VISITKEY));
        XHRService.POST(Const.BASE + 'Visits/' + CookieManager.readCookie(Const.VISITKEY) + '/event', dataToSend).then(
            function(responseData, textStatus, jqXHR){
                onSendSuccess();
                return true;
            },
            function(response, textStatus, errorThrown){
                var responseData = JSON.parse(response.target.response);
                onSendError(responseData);


                return false;
            }
        );
    };

    var startVisit = function(calback){
        XHRService.POST(Const.BASE + 'users/' + CookieManager.readCookie(Const.KEY) + '/visits/', {"startTime": Date.now()}).then(
            function(response, textStatus, jqXHR) {
                var responseData = JSON.parse(response.target.response);

                console.log('seting session data', responseData.id);
                CookieManager.createCookie(Const.VISITKEY,
                    responseData.id, 999999 * 24 * 60 * 60 * 1000);
                console.log('setting visit id');
                calback();
                return true;
            });
    };

    var getUserId = function() {
        var data2 = {};
        data2.title = 'userTracking';
        data2.w = screen.width;
        data2.h = screen.height;
        data2.registrationTime = Date.now();
        console.log(data2);

        var promise = new Promise(function(resolve, reject){
            XHRService.POST(Const.BASE + 'users', data2).then(
                function(response, textStatus, jqXHR) {
                    var responseData = JSON.parse(response.target.response);

                    console.log('setting users data', responseData);
                    CookieManager.createCookie(Const.KEY,
                        responseData.id, 999999 * 24 * 60 * 60 * 1000);
                    startVisit(resolve);
                    userModel.publish('userLogin', responseData.id);
                    //return true;
                },
                function(responseData, textStatus, errorThrown) {
                    startVisit(resolve);
                    console.log('setCookies', 'unregistered');
                    CookieManager.createCookie(Const.KEY,
                        'unregistered', 999999 * 24 * 60 * 60 * 1000);
                    console.log('o ffs');
                    userModel.publish('userLogout');
                    //return false;
                });
        });


        return promise;

    };

    var recordVisitStart = function(callback) {
        var dataObject = {};
        dataObject.hostname = location.host;
        dataObject.startTime = Date.now();

        XHRService.POST(Const.BASE + 'users/' + CookieManager.readCookie(Const.KEY) + '/visits', dataObject).then(
            function(response, textStatus, jqXHR) {
                var responseData = JSON.parse(response.target.response);
                callback(responseData);
            }, function(responseData, textStatus, errorThrown) {
                return false;
            }
        );
    };


    function onSendSuccess() {
        userTracking.isSending = false;
        console.log('success');

        console.log('minus', Math.abs(userTracking.userActionsTemp.length -
            userTracking.userActionsToSend.length));

        var difference = Math.abs(userTracking.userActionsTemp.length -
            userTracking.userActionsToSend.length);

        userTracking.userActions = userTracking.userActionsTemp.slice(0,
            difference).concat(userTracking.userActions);

        console.log('success, left:', userTracking.userActions.length);
        userTracking.userActionsToSend.length = 0;
        userTracking.userActionsTemp.length = 0;
        userTracking.repeater = 1;
        userTracking.divider = 0;
        // should stop session or should it continue when there are
        // events not sent?
        // if (userTracking.sessionInProgress) {
        //     userTracking.stopTracking();
        // }
    }

    function onSendError(e) {
        console.log('failure, but setted cookie and deleted logs');
        userTracking.isSending = false;
        switch (e.detail.status) {
            case 0:
                userTracking.repeater = 3;
                if (userTracking.userActionsTemp !== undefined && userTracking.userActionsTemp.length > 0) { // jshint ignore:line
                    userTracking.userActions =
                        userTracking.userActions.concat(userTracking.userActionsTemp);
                }
                userTracking.userActionsTemp.length = 0;
                console.log('server down');
                break;
            case 401:
                CookieManager.deleteCookies();

                var userId = JSON.parse(e.detail.responseText).userId;
                CookieManager.createCookie(Const.KEY, userId, 999999);
                
                DataStorage.clearData();
                break;
            case 413:
                console.log('too much info sent');
                if (userTracking.userActionsTemp !== undefined && userTracking.userActionsTemp.length > 0) { // jshint ignore:line
                    userTracking.userActions =
                        userTracking.userActions.concat(userTracking.userActionsTemp);
                }
                console.log('asdasdsa', userTracking.userActions.length);
                userTracking.userActionsTemp.length = 0;
                if (userTracking.divider === 0) {
                    console.log('userTracking.divider 0', userTracking.divider);
                    userTracking.divider = userTracking.userActions.length / 2;
                } else {
                    console.log('userTracking.divider > 0', userTracking.divider);
                    userTracking.divider += userTracking.divider / 2;
                }
                // CONSIDER THIS
                if (userTracking.divider.length >= userTracking.userActions.length) {
                    userTracking.userActionsToSend.length = 0;
                    userTracking.userActionsTemp.length = 0;
                    userTracking.repeater = 1;
                    userTracking.divider = 0;
                    DataStorage.clearData();
                }
                console.log('userTracking.divider', userTracking.divider);
                break;
            default:
                break;
        }
    }

    return {
        sendEventsToServer: sendToServer,
        shouldRecord: recordVisitStart,
        getUserId: getUserId
    };
})();