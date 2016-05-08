module.exports = (function Mediator() {
    'use strict';

    var mediators = [];

    var subscribe = function(channel, fn){
        var mediator = mediators[mediators.indexOf(this)];

        if (!mediator.channels[channel]) {
            mediator.channels[channel] = [];
        }
        mediator.channels[channel].push({ context : this, callback : fn });

        console.log('sub', this, channel, fn);

        return this;
    };

    var publish = function(channel){
        var mediator = mediators[mediators.indexOf(this)],
            mediatorChannel = mediator.channels[channel];
        
        if (!mediatorChannel) return;

        var args = Array.prototype.slice.call(arguments, 1);
        console.log('publish', this, channel);

        for(var i = 0, l = mediatorChannel.length; i < l; i++){
            var subscription = mediatorChannel[i];
        console.log('publish subscription',subscription);

            subscription.callback.apply(subscription.context, args);
        };
        return this;
    };

    return {
        installTo: function(obj){
            obj.channels = [];
            mediators.push(obj);
            
            obj.subscribe = subscribe;
            obj.publish = publish
        }
    };
})();