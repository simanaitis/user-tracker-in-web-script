var UserTracking = (function () {
    'use strict';

    var instance;

    function UserTracking() {

        var userTracking = new Object(),
            Const = require('./refactorConst.js'),

            Console = require('./refactorConsole.js'),
            UserDataManager = require('./userDataManager.js'),
            UserActionListener = require('./userActionListener.js'),
            DataStorage = require('./dataStorage.js'),
            ServerFunctions = require('./serverFunctions.js'),
            CookieManager = require('./cookieManager.js');

        userTracking.init = function () {
            if (!isLocalStorageEnalbed()) return;

            //FIX ME CAPTAIN
            DataStorage.initializeActionsArray();
            checkScreenSize();


            checkUser().then(function () {
                var eventsToTrack = getEventsToTrack();
                if (eventsToTrack.length) {
                    userTracking.startTracking(eventsToTrack);
                };
            });


        };

        userTracking.startTracking = function (settings) {
            Console.log('recording actions');

            userTracking.sessionInProgress = true;
            userTracking.addListeners(settings);
            sessionTimer(settings.endTime ? settings.endTime : Date.now() + Const.SESSION_TIME);
        };

        userTracking.stopTracking = function () {
            Console.log('deleted session cookie');

            userTracking.sessionInProgress = false;
            CookieManager.eraseCookie(Const.SESSION_NAME);
            if (CookieManager.readCookie(Const.SESSION_NAME) !== null) {
                CookieManager.createCookie(Const.SESSION_NAME, Const.SESSION_FAILED, userTracking.sessionMinutes * 1000);
            }
            userTracking.removeListeners();
            clearInterval(userTracking.interval);
        };

        userTracking.addListener = UserActionListener.addListener;
        userTracking.addListeners = UserActionListener.addListeners;
        userTracking.removeListeners = UserActionListener.removeListeners;

        function isLocalStorageEnalbed() {
            var mod = 'test';
            try {
                localStorage.setItem(mod, mod);
                localStorage.removeItem(mod);
                return true;
            } catch (e) {
                console.log('local storage is not supported in this browser');
                return false;
            }
        }

        function getEventsToTrack() {
            var sessionStatus = CookieManager.readCookie(Const.SESSION_NAME);

            if (!sessionStatus || sessionStatus !== 'undefined') {
                var data = {status: true, actionsToTrack: ['click', 'dbclick', 'scroll', 'zoom'], duration: 10000};
                Console.log('TRACKING EVENTS:', data.actionsToTrack);
                CookieManager.createCookie(Const.SESSION_NAME, JSON.stringify(data.actionsToTrack), data.duration);
                return data.actionsToTrack;
                //     ServerFunctions.shouldRecord(function(data) {
                //         data = {status: true, actionsToTrack: ['click', 'dbclick', 'scroll', 'zoom'], duration: 10000};
                //         //if (data.status) {
                //             Console.log('TRACKING EVENTS:', data.actionsToTrack);
                //             CookieManager.createCookie(Const.SESSION_NAME, JSON.stringify(data.actionsToTrack), data.duration);
                //             return data.actionsToTrack;
                //         /*} else {
                //             CookieManager.createCookie(Const.SESSION_NAME, Const.SESSION_STOPPED, data.duration);
                //             return [];
                //         }*/
                //     });
                // } else if (sessionStatus !== Const.DO_NOTHING) {
                //     return JSON.parse(sessionStatus);
            }

            return [];
        }

        function sessionTimer(endDate) {
            if (!endDate) return;
            //Console.info('launched timer');

            userTracking.interval = setInterval(function () {
                if (endDate >= Date.now()) {
                    DataStorage.checkStorageSize(true);
                    userTracking.stopTracking();
                }
            }, Const.INTERVAL_TIME);
        }

        function checkScreenSize() {
            //on script start get screen size if it is not saved
            var startscreenExists = userTracking.userActions.filter(function (action) {
                return action.eventType === 'startscreen';
            });
            if (!userTracking.userActions.length || !startscreenExists) {
                document.dispatchEvent(new CustomEvent('startscreen'));
            }
        }

        function checkUser() {
            var promise = new Promise(
                function (resolve, reject) {
                    var cookieInfo = CookieManager.readCookie(Const.KEY);
                    if (cookieInfo === null || cookieInfo.replace(Const.REGEXP, '$1') == undefined) {
                        ServerFunctions.getUserId().then(
                            function () {
                                resolve(CookieManager.readCookie(Const.KEY));
                            }
                        );
                    } else {
                        resolve(cookieInfo);
                    }
                });
            return promise;

        }

        // VERRY TEMP
        userTracking.userActions = [];
        userTracking.userActionsTemp = [];
        userTracking.userActionsToSend = [];
        userTracking.repeater = 1;
        userTracking.divider = 0;
        userTracking.isSending = false;
        userTracking.sessionInProgress = false;
        // VERRY TEMP

        return userTracking;
    }

    function createInstance() {
        return new UserTracking();
    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();

// EXPOSING INTENTIONALLY
userTracking = UserTracking.getInstance();

userTracking.init();
