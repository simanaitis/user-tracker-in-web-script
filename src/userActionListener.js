module.exports = (function UserActionListener() {
    'use strict';

    var Console = require('./refactorConsole.js'),
        UserDataManager = require('./userDataManager.js'),
        DataStorage = require('./dataStorage.js'),
        EventFactory = require('./eventFactory.js');
 
    var addListeners = function(settings) {
        removeListeners();

        Console.log('settings passed to action lisener', settings);

        // Listens to startscreen and unload. These functions should work always
        document.addEventListener('startscreen', genericEventHandler, false);
        window.addEventListener('unload', unloadHandler, false);

        var actions = typeof settings === 'string' ? settings.split(',') : settings;

        for (var i = 0, l = actions.length; i < l; i ++) {
            addListener(actions[i]);
        }
    };

    var addListener = function(eventType) {
        eventType = eventType.trim();
        switch(eventType) {
            case 'dblclick':
            case 'change':
            case 'dragstart':
            case 'drop':
                document.addEventListener(eventType, genericEventHandler, false);
            break;
            case 'focus':
                document.addEventListener(eventType, genericEventHandler, true);
            break;
            case 'click':
                document.addEventListener('click', clickHandler, false);
            break;
            case 'resize':
                window.addEventListener('resize', resizeHandler, false);
            break;
            case 'scroll':
                window.addEventListener('scroll', scrollHandler, false);
            break;
        }
    };

    var removeListeners = function() {
        Console.log('stopped listening to actions');
        document.removeEventListener('click', clickHandler, false);
        document.removeEventListener('dblclick', genericEventHandler, false);
        window.removeEventListener('resize', resizeHandler, false);
        document.removeEventListener('startscreen', genericEventHandler, false);
        document.removeEventListener('change', genericEventHandler, false);
        window.removeEventListener('unload', unloadHandler, false);
        window.removeEventListener('scroll', scrollHandler, false);
        document.removeEventListener('dragstart', genericEventHandler, false);
        document.removeEventListener('drop', genericEventHandler, false);
        document.removeEventListener('focus', genericEventHandler, true);
    };

    function saveEvent(e) {
        var createdEvent = EventFactory.createEvent(e);
        DataStorage.saveEventInfo(createdEvent);
    }

    function genericEventHandler(e) {
        // MAKE ME ALRIGHT AGAIN
        Console.log(e.detail);
        saveEvent(e);
    }

    var clickAllowed = true;
    function clickHandler(e) {
        if (clickAllowed) {
            clickAllowed = false;
            Console.log('click');
            saveEvent(e);
            setTimeout(function() {
                clickAllowed = true;
            }, 250);
        }
    }

    var resizeTimeout;
    function resizeHandler(e) {
        if (resizeTimeout) clearTimeout(resizeTimeout);

        resizeTimeout = setTimeout(function() {
            Console.log('resize');
            saveEvent(e);
        }, 400);
    }

    function unloadHandler(e) {
        //TODO end visit here
        Console.log('unload');
        DataStorage.writeActionsToStorage();
    }

    var scrollTimeout;
    function scrollHandler(e) {
        if (scrollTimeout) clearTimeout(scrollTimeout);

        scrollTimeout = setTimeout(function() {
            Console.log('scroll');
            saveEvent(e);
        }, 400);
    }

    return {
        addListener: addListener,
        addListeners: addListeners,
        removeListeners: removeListeners
    }
})();