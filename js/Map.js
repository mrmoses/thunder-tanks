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
    var SELF = this;

    var _private = {
        leftX: x,
        topY: y,
        width: w,
        length: h,
        poly: [
            [x,y],
            [x+w,y],
            [x+w,y+h],
            [x,y+h]
        ]
    }

    this.draw = function(c, gs) {
        // draw block
	c.fillStyle = 'rgba(200, 200, 200, 1.0)';
        c.fillRect(_private.leftX, _private.topY, _private.width, _private.length);



        /** The rest of this draw function is used for debugging */
        if (tt.debug) {
            c.lineWidth = 1;

            // draw aabb collision box
            var aabb = this.get_collision_aabb();
            c.strokeStyle = '#ff0000';
            c.rect(aabb[0], aabb[1], aabb[2], aabb[3]);
            //c.stroke();

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
        }
    }

    /** @returns {Array}  A rectangle of the boundaries of the entity with the form [x, y, w, h] */
    this.get_collision_aabb = function() {
        return [_private.leftX,_private.topY,_private.width,_private.length];
    }

    /** @returns {Array}  The center of the circle and the radius like this: return [[x, y], r] */
    this.get_collision_circle = function() {
        var aSqrd = (_private.length*_private.length)/4;
        var bSqrd = (_private.width*_private.width)/4;
        // equals c squared
        var radius = Math.sqrt(aSqrd+bSqrd);
        return [[_private.leftx,_private.topY], radius];
    }

    /** @returns {Array}  An array of lines of the form [[x1, y1], [x2, y2], ... [xn, yn]] */
    this.get_collision_poly = function() {
        return _private.poly;
    }
}