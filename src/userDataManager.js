module.exports = (function UserDataManager() {
    'use strict';

    var Const = require('./refactorConst.js'),
        MediatorService = require('./mediator.js'),
        CookieManager = require('./cookieManager.js');

    var userModel = {
            id: null
        },
        _url = null,
        _actions = [];

    (function init() {
        MediatorService.installTo(userModel);

        userModel.subscribe('userLogin', function(userId) {
            userModel.id = userId;
        });
        userModel.subscribe('userLogout', function() {
            userModel.id = null;
        });
    })();

    function _formSesionID() {
        console.log('user id was set:' + userModel.id);
        if ( !CookieManager.readCookie(Const.KEY)) {
            console.log('id was undefined');
            return false;
        }
        return true;
    }

    function _formUrl() {
        _url = document.domain;
        console.log('Domain: ' + document.domain);
    }

    function _formActions() {
        _actions = userTracking.userActions;
    }

    function formUserData(dataForSending) {
        if (_formSesionID()) {
            _actions = dataForSending;
        }
         
        _formUrl();
        var data = {
            userID: userModel.id,
            url: _url,
            actions: _actions
        };

        return data;
    }


    function getModel() {
        return userModel;
    }

    return {
        formUserData: formUserData,
        getModel: getModel
    };
})();