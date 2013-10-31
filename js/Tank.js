/**
 * @param {ThunderTanks} tt ThunderTanks instace.
 * @param {Object} data  Tank data (id, x, y)
 * @param {Boolean} remote True if the tank is a remote player
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
        length: 43,
        width: 36,
        x: data.x || 100,
        y: data.y || 100,
        angle: 0, // angle in radians
        poly: [], // array of points that (corners of the tank)
        speed: 0,
        maxSpeed: 4,
        aimAngle: MathUtil.degreesToRadians(0),
        firing: false,
        fireRate: 5, // number of shots per sec
        fireCooldown: 0,
        remote: remote,
        tankSprite: new Sprite(["center", "center"], {
            "still": [[SELF.tt.urlPath + '/images/tank/tanksprite1.png', 1] , [SELF.tt.urlPath + '/images/tank/tanksprite1.png'], 1],
            "forward": [[SELF.tt.urlPath + '/images/tank/tanksprite1.png', 1] , [SELF.tt.urlPath + '/images/tank/tanksprite1.png'], 1]
        },
        function() {
            _private.tankSprite.action("still");
            _private.tankSprite.angle(_private.angle);
        })
    }

    /**
     * @param {JSGameSoup} gs JSGameSoup instance
     */
    this.update = function(gs) {
        // these calculation are used a lot, so its done once here
        var cosA = Math.cos(_private.angle);
        var sinA = Math.sin(_private.angle);

        // move tank
        _private.x = _private.x + _private.speed * cosA;
        _private.y = _private.y + _private.speed * sinA;

        // more calculations that are reused, so they are calculated once here
        var LcosA = _private.length/2 * cosA;
        var LsinA = _private.length/2 * sinA;
        var WcosA = _private.width/2 * cosA;
        var WsinA = _private.width/2 * sinA;

        // recalculate corners
        _private.frontX = _private.x + LcosA;
        _private.frontY = _private.y + WsinA;
        _private.backX = _private.x - LcosA;
        _private.backY = _private.y - WsinA;
        _private.leftX = (_private.x) + WsinA;
        _private.leftY = (_private.y) - WcosA;
        _private.rightX = (_private.x) - WsinA;
        _private.rightY = (_private.y) + WcosA;
        _private.corner1x = _private.leftX - LcosA;
        _private.corner1y = _private.leftY - LsinA;
        _private.corner2x = _private.leftX + LcosA;
        _private.corner2y = _private.leftY + LsinA;
        _private.corner3x = _private.rightX + LcosA;
        _private.corner3y = _private.rightY + LsinA;
        _private.corner4x = _private.rightX - LcosA;
        _private.corner4y = _private.rightY - LsinA;

        // update poly points
        _private.poly = [
            [_private.corner1x,_private.corner1y],
            [_private.corner2x,_private.corner2y],
            [_private.corner3x,_private.corner3y],
            [_private.corner4x,_private.corner4y]
        ];

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

        if (!_private.remote && typeof multiplayerConn != 'undefined') {
            multiplayerConn.emit('player-tank-update', this.getData());
        }

        _private.tankSprite.angle(_private.angle);
        _private.tankSprite.update();
    };

    /**
     * @param {CanvasRenderingContext2D} c canvas context
     * @param {JSGameSoup} gs JSGameSoup instance
     */
    this.draw = function(c, gs) {

        // draw rectangle (tank "shadow" if sprite loads slowly)
        c.save(); //save the current draw state
        c.translate(_private.x,_private.y); //set drawing area to where the tank is
        c.rotate(_private.angle); //rotate drawing area to tank's angle
        c.fillRect(-_private.length/2, -_private.width/2, _private.length, _private.width); // draw the tank
        c.restore(); //restore the previous draw state

        // draw tank sprite
        c.save(); //save the current draw state
        _private.tankSprite.draw(c, [_private.x, _private.y]);
        c.restore(); //restore the previous draw state

        // draw cannon
        c.save();
        c.translate(_private.x,_private.y);
        c.rotate(_private.aimAngle);
        c.fillRect(0, 0, _private.length, 5);
        c.restore();

        /** The rest of this draw function is used for debugging */
        if (this.tt.debug) {
            c.lineWidth = 1;

            // draw aabb collision box
            var aabb = this.get_collision_aabb();
            c.strokeStyle = '#ff0000';
            c.rect(aabb[0], aabb[1], aabb[2], aabb[3]);
            c.stroke();

            // draw circle collision box
            var circle = this.get_collision_circle();
            c.strokeStyle = '#0000ff';
            c.beginPath();
            c.arc(circle[0][0], circle[0][1], circle[1], 0, 2 * Math.PI, false);
            c.stroke();

            // draw polygon collision box
            c.strokeStyle = '#ff00ff';
            c.beginPath();
            c.moveTo(_private.poly[0][0],_private.poly[0][1]);
            for(var i = 1; i < _private.poly.length; i++) {
                c.lineTo(_private.poly[i][0],_private.poly[i][1]);
            }
            c.closePath();
            c.stroke();

            // front circle
            c.beginPath();
            c.strokeStyle = "#00FF00";
            c.arc(_private.frontX, _private.frontY, 10, 0, 2 * Math.PI, false);
            c.stroke();

            // back circle
            c.beginPath();
            c.strokeStyle = "#FF0000";
            c.arc(_private.backX, _private.backY, 10, 0, 2 * Math.PI, false);
            c.lineWidth = 1;
            c.stroke();

            // left side circle
            c.beginPath();
            c.strokeStyle = "#FFFF00";
            c.arc(_private.leftX, _private.leftY, 3, 0, 2 * Math.PI, false);
            c.stroke();

            // right side circle
            c.beginPath();
            c.strokeStyle = "#00FFFF";
            c.arc(_private.rightX, _private.rightY, 3, 0, 2 * Math.PI, false);
            c.stroke();

            // corern 1 circle
            c.beginPath();
            c.strokeStyle = "#ff00ff";
            c.arc(_private.corner1x, _private.corner1y, 3, 0, 2 * Math.PI, false);
            c.stroke();

            // corner 2 circle
            c.beginPath();
            c.strokeStyle = "#ff00ff";
            c.arc(_private.corner2x, _private.corner2y, 3, 0, 2 * Math.PI, false);
            c.stroke();

            // corner 3 circle
            c.beginPath();
            c.strokeStyle = "#ff00ff";
            c.arc(_private.corner3x, _private.corner3y, 3, 0, 2 * Math.PI, false);
            c.stroke();

            // corner 4 circle
            c.beginPath();
            c.strokeStyle = "#ff00ff";
            c.arc(_private.corner4x, _private.corner4y, 3, 0, 2 * Math.PI, false);
            c.stroke();
        }
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

        // Ctrl
        this.keyDown_17 = function() {
            _private.ctrlkey = true;
        }
        this.keyUp_17 = function() {
            _private.ctrlkey = false;
        }

        // X
        this.keyUp_88 = function() {
            // Ctrl + X = self destruct
            if (_private.ctrlkey) {
                SELF.kill();
            }
        }

        this.keyDown = function (keyCode) {
            //console.log(keyCode);

            // w = 87, s = 83, a = 65, d = 68
            // up = 38, down = 40, left = 37, right = 39
            // Ctrl = 17
            // X = 88
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
            if (!_private.remote && typeof multiplayerConn != 'undefined') {
                multiplayerConn.emit('add-bullet', {
                    startx: barrelTipX,
                    starty: barrelTipY,
                    targetx: mousex,
                    targety: mousey
                });
            }
        }
    }

    /** Used to update remote tanks */
    this.remoteUpdate = function(data) {
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

    this.kill = function() {
        this.tt.removeTank(SELF.id);
    }

    /** True if this is a remote player's tank */
    this.isRemote = function() {
        return _private.remote;
    }

    /** @returns {Array}  A rectangle of the boundaries of the entity with the form [x, y, w, h] */
    this.get_collision_aabb = function() {
        return [_private.x - _private.length/2, _private.y - _private.width/2, _private.length, _private.width];
    }

    /** @returns {Array}  The center of the circle and the radius like this: return [[x, y], r] */
    this.get_collision_circle = function() {
        var aSqrd = (_private.length*_private.length)/4;
        var bSqrd = (_private.width*_private.width)/4;
        // equals c squared
        var radius = Math.sqrt(aSqrd+bSqrd);
        return [[_private.x,_private.y], radius];
    }

    /** @returns {Array}  An array of lines of the form [[x1, y1], [x2, y2], ... [xn, yn]] */
    this.get_collision_poly = function() {
        return _private.poly;
    }

    this.collide_aabb = function(entity, result) {
        //console.log('Tank collide_aabb', entity, result);
        if (entity instanceof Bullet) {
            if (typeof multiplayerConn === 'undefined' || !_private.remote) {
                SELF.kill();
            }
        } else if (entity instanceof Block || entity instanceof Tank) {
            _private.speed = 0;
        }
    }

    this.collide_circle = function(entity, result) {
        //console.log('Tank collide_circle', entity, result);
    }

    this.collide_polygon = function(entity, result) {
        //console.log('Tank collide_polygon', entity, result);
    }
}