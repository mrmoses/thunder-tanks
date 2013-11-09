if (typeof io != 'undefined') {
    var multiplayerConn = io.connect();
    multiplayerConn.on('connect', function() {
        console.log("connected to multiplayer server");
        $('#session-id').text(multiplayerConn.socket.sessionid);
        tt.alerts.connected();
    });
}
var ThunderTanks = function() {
    var SELF = this;

    /** @type JSGameSoup */
    this.game;

    // this entity gets a high priority for debugging/drawing collission borders
    this.priority = 1;

    /** @type String The URL path (without trailing /) */
    this.urlPath = window.location.pathname.substr(0, window.location.pathname.length - (/\/$/.test(window.location.pathname) ? 1 : 0));

    // draws collision boundaries
    this.debug = false;

    var _private = {
        /** Tanks by id **/
        tanks: {},

        tankArray: [],

        /** @type Array */
        obstacles: [],

        /** @type Array */
        bullets: [],

        playerTankDeployed: false
    };

    /**
     * Game Update (collision checks)
     *
     * @param {JSGameSoup} gs JSGameSoup instance
     */
    this.update = function(gs) {
        //collide bullets and map objects
        collide.aabb(_private.bullets, _private.obstacles);

        // collide bullets and bullets
        collide.circles(_private.bullets, _private.bullets);

        // collide bullets and tanks
        collide.aabb(_private.bullets, _private.tankArray);


        // collide tanks and map objects
        collide.aabb(_private.tankArray, _private.obstacles);

        // collide tanks and tanks
        //collide.aabb(_private.tankArray, _private.tankArray);

        return;
    }

    this.draw = function(c, gs) {
      /** draw collision areas */
      if (tt.debug) {
        var entities = _private.tankArray.concat(_private.obstacles);

        c.lineWidth = 1;
        for(var i = 0; i < entities.length; i++) {
          // draw aabb collision box
          if (entities[i].get_collision_aabb) {
            var aabb = entities[i].get_collision_aabb();
            c.strokeStyle = '#ff0000';
            c.rect(aabb[0], aabb[1], aabb[2], aabb[3]);
            c.stroke();
          }

          // draw circle collision box
          if (entities[i].get_collision_circle) {
            var circle = entities[i].get_collision_circle();
            c.strokeStyle = '#0000ff';
            c.beginPath();
            c.arc(circle[0][0], circle[0][1], circle[1], 0, 2 * Math.PI, false);
            c.stroke();
          }

          // draw polygon collision box
          if (entities[i].get_collision_poly) {
            var poly = entities[i].get_collision_poly();
            c.strokeStyle = '#ff00ff';
            c.beginPath();
            c.moveTo(poly[0][0],poly[0][1]);
            for(var p = 1; p < poly.length; p++) {
              c.lineTo(poly[p][0],poly[p][1]);
            }
            c.closePath();
            c.stroke();
          }
        }
      }
    }

    this.alerts = new Alerts();

    /**
     * @param {Object} data  The tanks data (id, x, y)
     * @param {Boolean} remote  True if the tanks is a remote tanks
     */
    this.addTank = function(data, remote) {
        _private.tanks[data.id] = new Tank(this, data, remote);
        _private.tankArray = $.map(_private.tanks, function(value,index) { return value;})
        this.game.addEntity(_private.tanks[data.id]);
        return _private.tanks[data.id];
    }

    this.addMap = function(mapConfig) {
        var map = new Map(SELF, mapConfig);
        this.game.addEntity(map);
        return map;
    }

    this.addObstacle = function(obst) {
        this.game.addEntity(obst);
        _private.obstacles.push(obst);
        return obst;
    }

    this.getObstacles = function() {
        return _private.obstacles;
    }

    /** Adds a bullet to the game.
     *
     * @param {int} startx The starting x coordinate.
     * @param {int} starty The starting y coordinate.
     * @param {int} targetx The target x coordinate.
     * @param {int} targety The target y coordinate.
     * @returns {Bullet} An instance of a Bullet.
     */
    this.addBullet = function(startx, starty, targetx, targety) {
        var b = new Bullet(this, _private.bullets.length, startx, starty, targetx, targety);
        _private.bullets.push(b);
        this.game.addEntity(b);
        return b;
    }

    this.removeTank = function(id) {
        var tank = _private.tanks[id];

        // remove the tank from the game
        this.game.delEntity(tank);
        delete _private.tanks[id];
        _private.tankArray = $.map(_private.tanks, function(value,index) { return value;});

        // if this was not a remote tank
        if (!tank.isRemote()) {
            // show alert
            SELF.alerts.killed();
            _private.playerTankDeployed = false;

            // tell server this tank is dead
            if (typeof multiplayerConn != 'undefined') {
                multiplayerConn.emit('tank-killed');
            }
        }

        return
    };

    this.removeBullet = function(bulletIndex) {
        this.game.delEntity(_private.bullets[bulletIndex]);
        delete _private.bullets[bulletIndex];
    };

    // defines clickable area
    this.pointerBox = function() {
        return [0, 0, this.game.width, this.game.height];
    }

    this.pointerDown = function(button) {
        if (!_private.playerTankDeployed) {
            _private.playerTankDeployed = true;
            var mouseposition = this.game.pointerPosition,
                mousex = mouseposition[0],
                mousey = mouseposition[1];

            switch (button) {
                case 0:
                    if (typeof multiplayerConn != 'undefined') {
                        multiplayerConn.emit('add-player-tank', {x: mousex, y:mousey});
                    } else {
                        SELF.addTank({id: 'player', x: mousex, y:mousey}, false);
                    }
                    break;
                case 2:
                    break;
            }

            SELF.alerts.clear();
        }
    };

    // init
    (function() {
        JSGameSoup.ready(function() {
            // use the DIV tag with Id of 'surface' as our game surface
            SELF.game = new JSGameSoup("game", 30);

            // add this instance of ThunderTanks
            SELF.game.addEntity(SELF);

            // add an instance of the map
            SELF.addMap(TTMaps.BigN);

            // launch the game
            SELF.game.launch();

            if (typeof multiplayerConn != 'undefined') {
                multiplayerConn.on('add-tank', function (data) {
                    var isRemote = data.id !== multiplayerConn.socket.sessionid;
                    // local player tank
                    if (isRemote) {
                        SELF.addTank(data, isRemote);
                    } else {
                        SELF.addTank(data, isRemote);
                    }
                });
                multiplayerConn.on('add-bullet', function (data) {
                    // add bullet
                    SELF.addBullet(data.startx, data.starty, data.targetx, data.targety);
                });
                multiplayerConn.on('remote-tank-update', function (data) {
                    // update tank
                    _private.tanks[data.id].remoteUpdate(data);
                });
                multiplayerConn.on('remove-tank', function (id) {
                    SELF.removeTank(id);
                });
            } else {
                tt.alerts.addAlert('info','Click anywhere to deploy a tank.');
                //SELF.addTank({id:'demo', x: 100, y: 100}, false);

                // enemy in the opposite corner
                SELF.addTank({id:'enemy1', x: SELF.game.width - 100, y: SELF.game.height - 100}, true);

                /** Target Practice
                for (var x = 50; x <= 500; x+=100){
                    for (var y = 50; y <= 500; y += 100) {
                        SELF.addPlayer({id:'target'+x+y,x:x,y:y}, true);
                    }
                }
                */
            }

        });
    })();
},
tt = new ThunderTanks();