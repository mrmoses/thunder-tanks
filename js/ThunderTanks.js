
var ThunderTanks = function() {
    var SELF = this;

    /** @type JSGameSoup */
    this.game;
    /** @type Tank */
    this.p1;

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

    this.addPlayer1 = function() {
        this.p1 = new Tank(this);
        this.game.addEntity(this.p1);
        return this.p1;
    }

    this.addMap = function() {
        var map = new Map(this);
        this.game.addEntity(map);
        return map;
    }

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

            // add player 1
            SELF.addPlayer1();

            // launch the game
            SELF.game.launch();
        });
    })();
},
tt = new ThunderTanks();