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
                  MapConfig.Textures[i][0],
                  MapConfig.Textures[i][1],
                  MapConfig.Textures[i][2],
                  MapConfig.Textures[i][3],
                  MapConfig.Textures[i][4])
      );
    }

    // blocks
    for(var i=0; i<MapConfig.Blocks.length; i++) {
      this.tt.addObstacle(
        new Block(tt,
                  MapConfig.Blocks[i][0],
                  MapConfig.Blocks[i][1],
                  MapConfig.Blocks[i][2],
                  MapConfig.Blocks[i][3],
                  MapConfig.Blocks[i][4])
      );
    }

    // polygons
    for(var i=0; i<MapConfig.Polys.length; i++) {
      this.tt.addObstacle(
        new Poly(tt,MapConfig.Polys[i])
      );
    }

    // render full map in memory and store as an image
    var canvasCache = document.createElement('canvas');
    canvasCache.setAttribute('width',SELF.game.width);
    canvasCache.setAttribute('height',SELF.game.height);
    var ccCtx = canvasCache.getContext('2d');

    var mapGraphics = tt.getObstacles();
    for (var i = 0; i<mapGraphics.length; i++) {
      mapGraphics[i]._draw(ccCtx);
    }
    background_img.src = canvasCache.toDataURL("image/png");

  }
}

function Texture(tt, x, y, w, h, img) {

  //this.draw = function(c, gs) {
  //  this._draw(c);
  //}

  this._draw = function(c) {
    c.fillStyle = c.createPattern(img,'repeat');
    c.fillRect(x,y,w,h);
  }
}

/** used for debugging */
function Line(point1, point2) {

  this.draw = function(c, gs) {
    this._draw(c);
  }

  this._draw = function(c) {
    c.strokeStyle = '#ff00ff';
    c.beginPath();
    c.moveTo(point1[0],point1[1]);
    c.lineTo(point2[0],point2[1]);
    c.stroke();

    // p1 circle
    c.beginPath();
    c.strokeStyle = "#000000";
    c.arc(point1[0], point1[1], 10, 0, 2 * Math.PI, false);
    c.stroke();

    //// p2 circle
    //c.beginPath();
    //c.strokeStyle = "#ffffff";
    //c.arc(point2[0], point2[1], 10, 0, 2 * Math.PI, false);
    //c.stroke();
  }
}

function Block(tt, x, y, w, h, img) {
  var SELF = this;

  var _private = {
      leftX: x,
      topY: y,
      width: w,
      height: h,
      poly: [
        [x,y],
        [x+w,y],
        [x+w,y+h],
        [x,y+h]
      ],
      imgCache: new Image()
  }

  //this.draw = function(c, gs) {
  //  this._draw(c);
  //}

  this._draw = function(c) {
    c.drawImage(_private.imgCache, _private.leftX, _private.topY);
  }

  /** @returns {Array}  A rectangle of the boundaries of the entity with the form [x, y, w, h] */
  this.get_collision_aabb = function() {
    return [_private.leftX,_private.topY,_private.width,_private.height];
  }

  /** @returns {Array}  The center of the circle and the radius like this: return [[x, y], r] */
  this.get_collision_circle = function() {
    var aSqrd = (_private.length*_private.height)/4;
    var bSqrd = (_private.width*_private.width)/4;
    // equals c squared
    var radius = Math.sqrt(aSqrd+bSqrd);
    return [[_private.leftx,_private.topY], radius];
  }

  /** @returns {Array}  An array of lines of the form [[x1, y1], [x2, y2], ... [xn, yn]] */
  this.get_collision_poly = function() {
    return _private.poly;
  };

  (function() {
    // render full map in memory and store as an image
    var canvasCache = document.createElement('canvas');
    canvasCache.setAttribute('width',_private.width);
    canvasCache.setAttribute('height',_private.height);
    var ccCtx = canvasCache.getContext('2d');

    // draw block
    ccCtx.fillStyle = img ? ccCtx.createPattern(img,'repeat') : 'rgba(200, 200, 200, 1.0)';
    ccCtx.fillRect(0,0,_private.width,_private.height);

    _private.imgCache.src = canvasCache.toDataURL("image/png");
  })();
}

function Poly(tt, points) {
  var SELF = this;

  var minX = points[0][0];
  var minY = points[0][1];
  var maxX = points[0][0];
  var maxY = points[0][1];

  //this.draw = function(c, gs) {
  //  this._draw(c);
  //}

  this._draw = function(c) {
    c.strokeStyle = '#000000';
    c.fillStyle = c.createPattern(grey1,'repeat');

    c.beginPath();
    c.moveTo(points[0][0],points[0][1]);
    for(var p = 1; p < points.length; p++) {
      c.lineTo(points[p][0],points[p][1]);
    }
    c.closePath();
    c.stroke();
    c.fill();
  }

  /** @returns {Array}  A rectangle of the boundaries of the entity with the form [x, y, w, h] */
  this.get_collision_aabb = function() {
    return [minX, minY, maxX - minX, maxY - minY];
  }

  /** @returns {Array}  The center of the circle and the radius like this: return [[x, y], r] */
  this.get_collision_circle = function() {
    console.log('Poly get_collision_circle not implemented yet');
  }

  /** @returns {Array}  An array of lines of the form [[x1, y1], [x2, y2], ... [xn, yn]] */
  this.get_collision_poly = function() {
    return points;
  };

  (function() {
    for(var p = 1; p < points.length; p++) {
      minX = Math.min(minX, points[p][0]);
      minY = Math.min(minY, points[p][1]);
      maxX = Math.max(maxX, points[p][0]);
      maxY = Math.max(maxY, points[p][1]);
    }
  })();
}