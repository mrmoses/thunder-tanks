/**
 * @param {ThunderTanks} tt ThunderTanks instace.
 * @param {Object} data players data (id, x, y)
 * @param {Boolean} remote True if the player is a remote player
 *
 */
function Tank(tt, data, remote) {
    var SELF = this;

    /** @type ThunderTanks */
    this.tt = tt;

    this.id = data.id;

    /** @type JSGameSoup */
    this.game = tt.game;

    var _private = {
        length: 35,
        width: 25,
        x: 100, //data.x,
        y: 100, //data.y,
        angle: MathUtil.degreesToRadians(45), // angle in radians
        speed: 0,
        maxSpeed: 4,
        aimAngle: MathUtil.degreesToRadians(0),
        firing: false,
        fireRate: 5, // number of shots per sec
        fireCooldown: 0,
        remote: remote
    }

    /**
     * @param {JSGameSoup} gs JSGameSoup instance
     */
    this.update = function(gs) {
        // move tank
        _private.x = _private.x + _private.speed * Math.cos(_private.angle);
        _private.y = _private.y + _private.speed * Math.sin(_private.angle);

        if (!_private.remote) {
            // update aim
            var mouseposition = gs.pointerPosition,
                mousex = mouseposition[0],
                mousey = mouseposition[1];
            _private.aimAngle = MathUtil.getAngle(_private.x,_private.y,mousex,mousey);
        }

        if (_private.firing && _private.fireCooldown === 0) {
            this.fireBullet();
        }
        if (_private.fireCooldown > 0) {
            _private.fireCooldown--;
        }

        if (!_private.remote && typeof socket != 'undefined') {
            socket.emit('client-player-update', this.getData());
        }
    };

    /**
     * @param {CanvasRenderingContext2D} c canvas context
     * @param {JSGameSoup} gs JSGameSoup instance
     */
    this.draw = function(c, gs) {
        // draw tank
        c.save(); //save the current draw state
        c.translate(_private.x,_private.y); //set drawing area to where the tank is
        c.rotate(_private.angle); //rotate drawing area to tank's angle
        c.fillRect(-_private.length/2, -_private.width/2, _private.length, _private.width); // draw the tank
        c.restore(); //restore the previous draw state

        // draw cannon
        c.save();
        c.translate(_private.x,_private.y);
        c.rotate(_private.aimAngle);
        c.fillRect(0, 0, _private.length, 5);
        c.restore();
    }

    // if its not a remote player, add controls
    if (!_private.remote) {

        // up (W)
        this.keyDown_38 = this.keyDown_87 = function () {
            _private.speed = 1;
        }
        this.keyHeld_38 = this.keyHeld_87 = function () {
            if (_private.speed < _private.maxSpeed)
                _private.speed += 1;
        }
        this.keyUp_38 = this.keyUp_87 = function () {
            _private.speed = 0;
        }

        // down (S)
        this.keyDown_40 = this.keyDown_83 = function () {
            _private.speed = -0.3;
        }
        this.keyHeld_40 = this.keyHeld_83 = function () {
            if (_private.speed > -_private.maxSpeed)
                _private.speed -= 0.3;
        }
        this.keyUp_40 = this.keyUp_83 = function () {
            _private.speed = 0;
        }

        // left (A)
        this.keyHeld_37 = this.keyDown_37 = this.keyHeld_65 = this.keyDown_65 = function () {
            _private.angle -= 0.1;
        }

        // right (D)
        this.keyHeld_39 = this.keyDown_39 = this.keyHeld_68 = this.keyDown_68 = function () {
            _private.angle += 0.1;
        }

        this.keyDown = function (keyCode) {
            //console.log(keyCode);

            // w = 87, s = 83, a = 65, d = 68
            // up = 38, down = 40, left = 37, right = 39
        }

        this.pointerBox = function() {
            return [0, 0, this.game.width, this.game.height];
        }

        this.pointerDown = function(button) {
            //console.log("tank pointerDown", button);
            switch (button) {
                case 0:
                    _private.firing = true;
                    break;
                case 2:
                    break;
            }
        }

        this.pointerUp = function(button) {
            //console.log("tank pointerUp", button);
            switch (button) {
                case 0:
                    _private.firing = false;
                    break;
                case 2:
                    break;
            }
        }

        this.fireBullet = function() {
            _private.fireCooldown = this.game.framerate / _private.fireRate;

            var mouseposition = this.game.pointerPosition,
                mousex = mouseposition[0],
                mousey = mouseposition[1],
                barrelTipX = _private.x + _private.length * Math.cos(_private.aimAngle),
                barrelTipY = _private.y + _private.length * Math.sin(_private.aimAngle);

            tt.addBullet(barrelTipX,barrelTipY,mousex,mousey);

            // send bullets to remote players
            if (!_private.remote && typeof socket != 'undefined') {
                socket.emit('add-bullet', {
                    startx: barrelTipX,
                    starty: barrelTipY,
                    targetx: mousex,
                    targety: mousey
                });
            }
        }
    }

    /** Used to update remote players */
    this.playerUpdate = function(data) {
        _private.x = data.x;
        _private.y = data.y;
        _private.angle = data.angle;
        _private.aimAngle = data.aimAngle;
    }

    this.getData = function() {
      return {
        id: this.id,
        x: _private.x,
        y: _private.y,
        angle: _private.angle,
        aimAngle: _private.aimAngle
      };
    }

    /* @returns[Array] a rectangle of the boundaries of the entity with the form [x, y, w, h] */
    this.get_collision_aabb = function() {
        return [_private.x - _private.length/2, _private.y - _private.width/2, _private.length, _private.width];
    }

    this.collide_aabb = function(entity, result) {
        //console.log('Tank collide_aabb', entity, result);
    }

    this.collide_circle = function(entity, result) {
        //console.log('Tank collide_circle', entity, result);
    }

    this.collide_polygon = function(entity, result) {
        //console.log('Tank collide_polygon', entity, result);
    }
}