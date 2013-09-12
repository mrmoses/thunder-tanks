if (typeof io != 'undefined') {
    var socket = io.connect();
}
var ThunderTanks = function() {
    var SELF = this;

    /** @type JSGameSoup */
    this.game;

    this.players = {};

    /** @type Array */
    this.obstacles = [];

    var _private = {
        /** @type Array */
        bullets: []
    };

    /**
     * @param {JSGameSoup} gs JSGameSoup instance
     */
    this.update = function(gs) {
        collide.aabb(_private.bullets, this.obstacles);
        collide.circles(_private.bullets, _private.bullets);
        return;
    }

    /**
     * @param {Object} data The players data (id, x, y)
     * @param {Boolean} remote True if the player is a remote player
     */
    this.addPlayer = function(data, remote) {
        this.players[data.id] = new Tank(this, data, remote);
        this.game.addEntity(this.players[data.id]);
        return this.players[data.id];
    }

    this.addMap = function() {
        var map = new Map(this);
        this.game.addEntity(map);
        return map;
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
                    SELF.players[data.id].playerUpdate(data);
                });
                socket.on('delete-player', function (id) {
                    SELF.game.delEntity(SELF.players[id]);
                    delete SELF.players[id];
                });
            } else {
                SELF.addPlayer({id:'demo'}, false);
            }

        });
    })();
},
tt = new ThunderTanks();