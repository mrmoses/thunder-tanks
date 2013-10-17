function Map(tt) {
    var SELF = this;

    /** @type ThunderTanks */
    this.tt = tt;

    /** @type JSGameSoup */
    this.game = tt.game;

    this.init = function() {
        // add map boundary boxes for collision detection

        // top boundary
        var top =  new Block(-5, -100, this.game.width + 5, 100);
        this.tt.addObstacle(top);

        var bottom =  new Block(-5, this.game.height, this.game.width + 5, 100);
        this.tt.addObstacle(bottom);

        var left = new Block(-100, -5, 100, this.game.height + 5);
        this.tt.addObstacle(left);

        var right =  new Block(this.game.width, -5, 100, this.game.height + 5);
        this.tt.addObstacle(right);


        // block in the middle
        var block1 = new Block(this.game.width*.25-50, this.game.height*.25-50, 100, 100);
        this.tt.addObstacle(block1);

        // block in the middle
        var block2 = new Block(this.game.width*.75-50, this.game.height*.25-50, 100, 100);
        this.tt.addObstacle(block2);

        // block in the middle
        var block3 = new Block(this.game.width*.25-50, this.game.height*.75-50, 100, 100);
        this.tt.addObstacle(block3);

        // block in the middle
        var block4 = new Block(this.game.width*.75-50, this.game.height*.75-50, 100, 100);
        this.tt.addObstacle(block4);
    }
}

function Block(x,y,w,h) {
    this.draw = function(c, gs) {
        // draw block
	c.fillStyle = 'rgba(200, 200, 200, 1.0)';
        c.fillRect(x, y, w, h);
    }

    /* @returns[Array] a rectangle of the boundaries of the entity with the form [x, y, w, h] */
    this.get_collision_aabb = function() {
        return [x,y,w,h];
    }
}