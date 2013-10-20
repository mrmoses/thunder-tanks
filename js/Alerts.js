function Alerts() {
    var SELF = this;

    var _private = {
        killedMessages: [
            '<strong>You dead.</strong> Click anywhere to deploy another tank.',
            '<strong>Kablam!</strong> Elimination; lack of education. Click anywhere to deploy another tank.'
        ]
    }

    /**
     * @param {String} type  'success' 'info' 'warning' or 'danger'
     * @param {String} message  The message (html) of the alert
     */
    this.addAlert = function(type, message) {
        var speed = (type === 'danger') ? 'fast' : '';
        $('.alerts').prepend(
            $('<div class="alert alert-' + type + '">' + message + '</div>').fadeIn(speed)
        );
    }

    this.connected = function() {
        this.addAlert('info','<strong>Connected!</strong> Click anywhere to deploy a tank.');
    }

    this.killed = function(killedMessageIndex) {
        killedMessageIndex = killedMessageIndex || Math.floor(Math.random() * _private.killedMessages.length);
        this.addAlert('danger',_private.killedMessages[killedMessageIndex]);
    }

    this.clear = function() {
        $('.alerts').children().fadeOut();
    }
}