if (typeof io != 'undefined') {
    var socket = io.connect();
}
var ThunderTanks = function() {
    var SELF = this;

    /** @type JSGameSoup */
    this.game;

    var _private = {
        /** Players by id **/
        playersIndex: {},

        /** @type Array Players array. */
        players: [],

        /** @type Array */
        obstacles: [],

        /** @type Array */
        bullets: []
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
        collide.aabb(_private.bullets, _private.players);

        // collide tanks and map objects
        collide.aabb(_private.players, _private.obstacles);

        // collide tanks and tanks
        collide.aabb(_private.players, _private.players);

        return;
    }

    /**
     * @param {Object} data The players data (id, x, y)
     * @param {Boolean} remote True if the player is a remote player
     */
    this.addPlayer = function(data, remote) {
        _private.playersIndex[data.id] = new Tank(this, data, remote);
        _private.players.push(_private.playersIndex[data.id]);
        this.game.addEntity(_private.playersIndex[data.id]);
        return _private.playersIndex[data.id];
    }

    this.addMap = function() {
        var map = new Map(this);
        this.game.addEntity(map);
        return map;
    }

    this.addObstacle = function(obst) {
        this.game.addEntity(obst);
        _private.obstacles.push(obst);
        return obst;
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

    this.removePlayer = function(id) {
        this.game.delEntity(_private.playersIndex[id]);

        delete _private.playersIndex[id];
        var i = _private.players.length;
        for (;i--;) {
            if (_private.players[i]) {
                if (_private.players[i].id === id) {
                    delete _private.players[i];
                    return
                }
            }
        }
        return
    };

    this.removeBullet = function(bulletIndex) {
        this.game.delEntity(_private.bullets[bulletIndex]);
        delete _private.bullets[bulletIndex];
    };

    // init
    (function() {
        JSGameSoup.ready(function() {
            // use the DIV tag with Id of 'surface' as our game surface
            SELF.game = new JSGameSoup("game", 30);

            // add this instance of ThunderTanks
            SELF.game.addEntity(SELF);

            // add an instance of the map
            SELF.addMap();

            // launch the game
            SELF.game.launch();

            if (typeof socket != 'undefined') {
                socket.on('add-player', function (data) {
                    // add player
                    SELF.addPlayer(data, data.id !== socket.socket.sessionid);
                });
                socket.on('add-bullet', function (data) {
                    // add bullet
                    SELF.addBullet(data.startx, data.starty, data.targetx, data.targety);
                });
                socket.on('remote-player-update', function (data) {
                    // update player
                    _private.playersIndex[data.id].playerUpdate(data);
                });
                socket.on('delete-player', function (id) {
                    SELF.removePlayer(id);
                });
            } else {
                SELF.addPlayer({id:'demo', x: 100, y: 100}, false);

                // enemy in the opposite corner
                SELF.addPlayer({id:'enemy1', x: SELF.game.width - 100, y: SELF.game.height - 100}, true);

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