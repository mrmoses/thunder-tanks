function Map(tt, MapConfig) {
  var SELF = this;

  /** @type ThunderTanks */
  this.tt = tt;

  /** @type JSGameSoup */
  this.game = tt.game;

  // cached, fully rendered map
  var background_img = new Image();

  this.draw = function(c,gs) {
    c.drawImage(background_img, 0, 0);
  }

  this.init = function() {
    // add boundary boxes for collision detection
    this.tt.addObstacle(new Block(tt, -5, -100, this.game.width + 5, 100)); // top
    this.tt.addObstacle(new Block(tt, -5, this.game.height, this.game.width + 5, 100)); // bottom
    this.tt.addObstacle(new Block(tt, -100, -5, 100, this.game.height + 5)); // left
    this.tt.addObstacle(new Block(tt, this.game.width, -5, 100, this.game.height + 5)); // right

    // textures
    for(var i=0; i<MapConfig.Textures.length; i++) {
      this.tt.addObstacle(
        new Texture(tt,
                  MapConfig.Textures[i].img,
                  MapConfig.Textures[i].x,
                  MapConfig.Textures[i].y,
                  MapConfig.Textures[i].w,
                  MapConfig.Textures[i].h)
      );
    }

    // blocks
    for(var i=0; i<MapConfig.Blocks.length; i++) {
      this.tt.addObstacle(
        new Block(tt,
                  MapConfig.Blocks[i].x,
                  MapConfig.Blocks[i].y,
                  MapConfig.Blocks[i].w,
                  MapConfig.Blocks[i].h)
      );
    }

    // render full map in memory and store as an image
    var canvasCache = document.createElement('canvas');
    canvasCache.setAttribute('width',SELF.game.width);
    canvasCache.setAttribute('height',SELF.game.height);
    var ccCtx = canvasCache.getContext('2d');

    var obstacles = tt.getObstacles();
    for (var i = 0; i<obstacles.length; i++) {
      obstacles[i]._draw(ccCtx);
    }
    background_img.src = canvasCache.toDataURL("image/png");

  }
}

function Texture(tt, img, x, y, w, h) {
  this._draw = function(c) {
    c.drawImage(img, x, y, w, h);
  }
}

function Block(tt, x, y, w, h) {
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

  this._draw = function(c) {
    // draw block
    c.fillStyle = 'rgba(200, 200, 200, 1.0)';
    c.rect(_private.leftX, _private.topY, _private.width, _private.length);
    c.drawImage(bricks, _private.leftX, _private.topY, _private.width, _private.length);
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