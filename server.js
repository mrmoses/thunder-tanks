var express = require('express')
  , path = require('path')
  , app = express()
  , host = process.env.IP || 'localhost'
  , port = process.env.PORT || 5000
  , io = require('socket.io').listen(app.listen(port, host));

app.configure(function(){
  // serve css and js folders as static files
  app.use('/css', express.static(path.join(__dirname, 'css')));
  app.use('/js', express.static(path.join(__dirname, 'js')));
  app.use('/images', express.static(path.join(__dirname, 'images')));
});

app.get('/', function(req, res){
  res.sendfile('index.html');
});

console.log('Listening on port ' + port);

/* Heroku Socket.IO configuration https://devcenter.heroku.com/articles/using-socket-io-with-node-js-on-heroku */
// assuming io is the Socket.IO server object
// io.configure(function () {
//   io.set("transports", ["xhr-polling"]);
//   io.set("polling duration", 10);
// });
/* END Heroku Socket.IO configuration */


/** Here be multiplayer dragons */

var playerIds = [];
var players = {};

io.sockets.on('connection', function (socket) {
  console.log("new player connecting", socket.id);

  new Player(socket);
});

/** An server side instance of a Player */
function Player(socket) {
  var SELF = this;

  this.id = socket.id;

  var _private = {
    socket: socket
  }

  // when this player is updated, send data to all remotes
  _private.socket.on('client-player-update', function (data) {
    //update the players data
    players[data.id].x = data.x;
    players[data.id].y = data.y;
    players[data.id].angle = data.angle;
    players[data.id].aimAngle = data.aimAngle;

    //send update to other users
    _private.socket.broadcast.emit('remote-player-update', players[data.id]);
  });

  // when a player is killed, send data to all remotes
  _private.socket.on('player-killed', function () {
    //send update to other users
    _private.socket.broadcast.emit('delete-player', SELF.id);
  });

  // when a player fires a bullet, send data to all remotes
  _private.socket.on('add-bullet', function (data) {
    //send update to other users
    _private.socket.broadcast.emit('add-bullet', data);
  });

  /* when a player disconnects */
  _private.socket.on('disconnect', function () {
    console.log("player disconnected " + SELF.id);

    // delete this everywhere it might exist
    delete players[SELF.id];
    var spliceLoc = 0;
    for (var i = 0; i < playerIds.length; i++) {
      if (playerIds[i] === SELF.id) {
        spliceLoc = i;
      }
    }
    playerIds.splice(spliceLoc,1);

    console.log("players", players);
    console.log("playerIds", playerIds);

    //remove this player from all remotes
    _private.socket.broadcast.emit('delete-player', SELF.id);
  });

  this.getData = function() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      angle: this.angle,
      aimAngle: this.aimAngle
    };
  };

  // init
  (function() {
    // add player to list of all players
    playerIds.push(SELF.id);
    players[SELF.id] = SELF;

    // spawn all players for this player (this player and all remotes)
    console.log("players", players);
    console.log("playerIds", playerIds);
    for (var i = 0; i < playerIds.length; i++) {
      console.log("adding player");
      _private.socket.emit('add-player', players[playerIds[i]].getData());
    }

    //spawn this player on all remotes
    _private.socket.broadcast.emit('add-player', SELF.getData());
  })();

  return SELF;
}