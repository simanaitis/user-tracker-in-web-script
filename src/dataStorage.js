module.exports = (function DataStorage() {
    'use strict';

    var UserDataManager = require('./userDataManager.js'),
        ServerFunctions = require('./serverFunctions.js'),
        Const = require('./refactorConst.js');

    var initializeActionsArray = function() {
        var value = localStorage[Const.KEY];
        if (value !== undefined) {
            localStorage.removeItem(Const.KEY);
            var tmp = userTracking.userActions.concat(JSON.parse(value));
            userTracking.userActions = tmp;
        } else {
            userTracking.userActions = [];
        }
    };

    var saveEventInfo = function(eventInfo) {
        console.log('saveEventInfo', eventInfo);

        userTracking.userActions.push(eventInfo);
        checkStorageSize();
    }; 

    var clearData = function() {
        userTracking.userActions.length = 0;
    };

    var checkStorageSize = function(sendNow) {
        var size = userTracking.userActions.length;
        if (size === 0 && sendNow) {
            sendNow = false;
        }
        console.log('Log contains ' + size + ' item(s), and will sync after reaches ' + Const.MAX_ALLOWED_SIZE);
        if (size === Const.MAX_ALLOWED_SIZE - 1) {
            console.log('will sync after one more log entry');
        }
        if ((size >= Const.MAX_ALLOWED_SIZE && (size % userTracking.repeater) === 0 ) || (sendNow && size > 1)) { // jshint ignore:line
            if (userTracking.isSending === true) {
                console.log('won\'t send, because currently is sending');
                return;
            }
            userTracking.isSending = true;
            console.log('will send, because currently isn\'t sending');

            if (userTracking.userActionsTemp.length === 0) {
                userTracking.userActionsTemp = userTracking.userActions.slice(0);
            }
            userTracking.userActionsToSend =
                userTracking.userActions.slice(userTracking.divider);

            clearData();
            var formData = UserDataManager.formUserData(userTracking.userActionsToSend);
            ServerFunctions.sendEventsToServer(userTracking.userActionsToSend);
        }

    };

    var writeActionsToStorage = function() {
        if (userTracking.userActionsTemp && userTracking.userActionsTemp.length) {
            userTracking.userActions = userTracking.userActions.concat(userTracking.userActionsTemp);
        }
        if (userTracking.userActions.length > 0) {
            localStorage.setItem(Const.KEY, JSON.stringify(userTracking.userActions));
            console.log('wrote actions to local storage');
        }
    };

    return {
        initializeActionsArray: initializeActionsArray,
        saveEventInfo: saveEventInfo,
        clearData: clearData,
        checkStorageSize: checkStorageSize,
        writeActionsToStorage: writeActionsToStorage
    };
})();