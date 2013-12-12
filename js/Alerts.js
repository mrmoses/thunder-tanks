var tt = (function(tt) {

    var _private = {
        killedMessages: [
            '<strong>You dead.</strong> Click anywhere to deploy another tank.',
            '<strong>Kablam!</strong> Elimination; lack of education. Click anywhere to deploy another tank.',
            '<strong>You got got!</strong> Click anywhere to deploy another tank.',
            '<strong>Dead Place!</strong> Click anywhere to deploy another tank and try again.',
            '<strong>Hasta la bye bye.</strong> Your tank was destroyed. Click anywhere to deploy another tank.'
        ]
    }

    tt.alerts = {
        /**
         * @param {String} type  'success' 'info' 'warning' or 'danger'
         * @param {String} message  The message (html) of the alert
         */
        addAlert: function(type, message) {
            var speed = (type === 'danger') ? 'fast' : '';
            $('.alerts').prepend(
                $('<div class="alert alert-' + type + '">' + message + '</div>').fadeIn(speed)
            );
        },

        connected: function() {
            this.addAlert('info','<strong>Connected!</strong> Click anywhere to deploy a tank.');
        },

        killed: function(killedMessageIndex) {
            killedMessageIndex = killedMessageIndex || Math.floor(Math.random() * _private.killedMessages.length);
            this.addAlert('danger',_private.killedMessages[killedMessageIndex]);
        },

        clear: function() {
            $('.alerts').children().fadeOut();
        }
    }

    return tt;
})(tt || {});