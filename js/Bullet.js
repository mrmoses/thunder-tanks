function Bullet(tt, bulletIndex, startx, starty, targetx, targety, speed) {
    var SELF = this;

    /** @type ThunderTanks */
    this.tt = tt;

    /** @type JSGameSoup */
    this.game = tt.game;

    var _private = {
        bulletIndex: bulletIndex,
        x: startx || this.game.width/2,
        y: starty || this.game.height/2,
        targetx: targetx || this.game.random(0,this.game.width),
        targety: targety || this.game.random(0,this.game.height),
        speed: speed || 0.22,
        radius: 3,
        angle: MathUtil.getAngle(startx,starty,targetx,targety),
        poly: [], // poly collision boundary
        bounces: 1,
        animation: new Sprite(["center","center"], {
            "move": [[SELF.tt.urlPath + '/images/bullet1.png', 7],[SELF.tt.urlPath + '/images/bullet2.png', 7]]
        }, function() {
            _private.animation.action("move");
            _private.animation.angle(_private.angle);
        })
    };
    _private.physCircle = Physics.body('circle', {
        x: _private.x,
        y: _private.y,
        vx: _private.speed * Math.cos(_private.angle),
        vy: _private.speed * Math.sin(_private.angle),
        radius: _private.radius
    });

    if (tt.debug) {
        // draw a line for the initial path of the bullet
        tt.game.addEntity(new Line([_private.x,_private.y],[_private.targetx,_private.targety]));
    }

    var _events = {
        moveForward: function(frames) {
            // move bullet
            _private.x = _private.x + (_private.speed * frames) * Math.cos(_private.angle);
            _private.y = _private.y + (_private.speed * frames) * Math.sin(_private.angle);
        },

        /** Change direction of bullet
         *
         * @param {Array} line  Two points the define the plan the bullet is bouncing off of.
         */
        richochet: function(line) { // take your aim, fire away, fire away!

            var p1 = line[0];
            var p2 = line[1];

            // draw a line to show where the collission is
            if (tt.debug) {
                tt.game.addEntity(new Line(p1,p2));
            }

            // the angle of the line the bullet is hitting
            var objectAngle = MathUtil.radiansToDegrees(MathUtil.getAngle(p1[0], p1[1], p2[0], p2[1]));
            // the angle the bullet is travelling
            var bulletAngle = MathUtil.radiansToDegrees(_private.angle);
            // the new angle of the bullet after bouncing
            var newAngle = MathUtil.degreesToRadians(objectAngle + objectAngle - bulletAngle);

            // show the new angle
            if (tt.debug) {
                var newPathX = _private.x + 50 * Math.cos(newAngle);
                var newPathY = _private.y + 50 * Math.sin(newAngle);
                // draw a line for the new path of the bullet
                tt.game.addEntity(new Line([_private.x,_private.y],[newPathX,newPathY]));
            }

            // bound the bullet
            _private.angle = newAngle;
            _private.animation.angle(_private.angle);
            _private.bounces--;
        }
    }

    function getPoly() {
        var numSides = 8;
        _private.poly = [];
        for (var i = 0; i < numSides; i++) {
            var angle = i * Math.PI / (numSides / 2);
            var x = _private.x + _private.radius * Math.sin(angle);
            var y = _private.y + _private.radius * Math.cos(angle);
            _private.poly.push([x, y]);
        }
    }

    /**
     * @param {JSGameSoup} gs JSGameSoup instance
     */
    this.update = function(gs) {
        // get position from phys object
        _private.x = _private.physCircle.state.pos['_'][0];
        _private.y = _private.physCircle.state.pos['_'][1];

        // update sprite
        _private.animation.update();

        // update poly points
        getPoly();
    }

    /**
     * @param {CanvasRenderingContext2D} c canvas context
     * @param {JSGameSoup} gs JSGameSoup instance
     */
    this.draw = function(c, gs) {
        // draw bullet
        c.beginPath();
        c.arc(_private.x, _private.y, _private.radius + 1, 0, 2 * Math.PI, false);
        c.lineWidth = 1;
        c.stroke();

        // draw sprite
        c.save(); //save the current draw state
        _private.animation.draw(c,[_private.x,_private.y]);
        c.restore(); //restore the previous draw state

        /** draw collision areas */
        if (tt.debug) {
            c.strokeStyle = '#ff00ff';
            c.beginPath();
            c.moveTo(_private.poly[0][0],_private.poly[0][1]);
            for(var p = 1; p < _private.poly.length; p++) {
              c.lineTo(_private.poly[p][0],_private.poly[p][1]);
            }
            c.closePath();
            c.stroke();
        }
    }

    this.kill = function() {
        this.tt.removeBullet(_private.bulletIndex);
    }

    /* @returns[Array] a rectangle of the boundaries of the entity with the form [x, y, w, h] */
    this.get_collision_aabb = function() {
        return [_private.x, _private.y, _private.radius, _private.radius];
    }

    /* @returns {Array} the center of the circle and the radius like this: return [[x, y], r] */
    this.get_collision_circle = function() {
        return [[_private.x,_private.y],_private.radius];
    }

    /** @returns {Array}  An array of lines of the form [[x1, y1], [x2, y2], ... [xn, yn]] */
    this.get_collision_poly = function() {
        return _private.poly;
    }

    this.collide_aabb = function(entity, result) {

        var polycollision = collide.collide_poly_entities(this,entity);

        if (polycollision) {
            if (entity instanceof Tank || !_private.bounces) {
                return SELF.kill();
            }

            // poly collision could be intersecting lines, or 1 point
            if (polycollision.length > 1) {
                var line1 = polycollision[0]; // bullet
                var line2 = polycollision[1]; // object

                _events.richochet(line2);
            } else {
                console.log("single point collision", polycollision);

                // the bullet must have skipped right over the edge-to-edge collission
                // back that thang up to collide with the edge (next frame)

                _events.moveForward(-1.5);
            }
        }
    }

    this.collide_circle = function(entity, result) {
        if (entity !== this) {
            this.kill();
        }
    }

    this.collide_polygon = function(entity, result) {
        console.log('bullet collide_polygon', entity, result);
    };

    // init
    (function() {
        getPoly();
        tt.world.add( _private.physCircle );
    })();
}