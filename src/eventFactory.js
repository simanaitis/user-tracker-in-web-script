module.exports = (function EventFactory() {
    'use strict';

    // POSSIBILITY TO CHANGE PRECISION ON RUNTIME
    var Precision = require('./utils/precision.js');
    // Precision.setPrecision(new Precision.tenthsFloorPrecision());

    function _getCoordinates(event) {
        var X,
            Y;
        if ((event.clientX || event.clientY) && document.body &&
            document.body.scrollLeft !== null) {
            X = event.clientX + document.body.scrollLeft;
            Y = event.clientY + document.body.scrollTop;
        }
        if ((event.clientX || event.clientY) &&
            document.compatMode === 'CSS1Compat' && document.documentElement &&
            document.documentElement.scrollLeft !== null) {
            X = event.clientX + document.documentElement.scrollLeft;
            Y = event.clientY + document.documentElement.scrollTop;
        }
        if (event.pageX || event.pageY) {
            X = event.pageX;
            Y = event.pageY;
        }
        if (event.type === 'scroll') {
            X = pageXOffset;
            Y = pageYOffset;
        }

        if (event.type === 'focus' || event.type === 'change') {
            if (event.target.getBoundingClientRect) {
                var bodyRect = document.body.getBoundingClientRect(),
                    elemRect = event.target.getBoundingClientRect();
                X = elemRect.top - bodyRect.top;
                Y = elemRect.left - bodyRect.left;
            }
        }

        return Precision.calculate({
            X: X,
            Y: Y
        });
    }

    // Factory
    function createEvent(event) {
        var createdEvent;

        switch (event.type) {
            case 'click':
            case 'dblclick':
            case 'focus':
            case 'dragstart':
            case 'drop':
            case 'change':
                createdEvent = new InteractEvent(event);
            break;
            case 'resize':
            case 'startscreen':
                createdEvent = new BasicEvent(event);
            break;
            case 'scroll':
                createdEvent = new ScrollEvent(event);
            break;
        }

        return createdEvent;
    };

    // Base class
    function BasicEvent (event) {
        var body = document.body,
            html = document.documentElement;

        this.type = event.type;
        this.time = Date.now(); // or event.timeStamp
        this.documentHeight = Math.max(body.scrollHeight, body.offsetHeight, 
            html.clientHeight, html.scrollHeight, html.offsetHeight);
        this.documentWidth = Math.max(body.scrollWidth, body.offsetWidth, 
            html.clientWidth, html.scrollWidth, html.offsetWidth);
        this.path = window.location.pathname;
    }

    // InteractEvent
    function InteractEvent(event) {
        // Call the parent constructor
        BasicEvent.call(this, event);

        if (event.target && event.target.id) {
            this.elementId = event.target.id;
        }

        var coordinates = _getCoordinates(event);
        this.positionX = coordinates.X;
        this.positionY = coordinates.Y;
    }
    // inherit 
    InteractEvent.prototype = BasicEvent;
    // correct the constructor pointer because it points to BasicEvent
    InteractEvent.prototype.constructor = InteractEvent;


    // ScrollEvent
    function ScrollEvent(event) {
        BasicEvent.call(this, event);

        this.screenWidth = window.innerWidth;
        this.screenHeight = window.innerHeight;
    }

    ScrollEvent.prototype = BasicEvent;
    ScrollEvent.prototype.constructor = ScrollEvent;

    return {
        createEvent: createEvent
    };
})();