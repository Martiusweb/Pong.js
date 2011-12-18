/**
 * Pong.js
 * @author Martin Richard
 *
 * Pong server main class
 */

var http = require('http');
var serveStatic = require('./serveStatic.js');

var Pong = function() {
  /**
   * Http server for the game
   */
  this.appServer;
  /**
   * socket.io object
   */
  this.io;
  /**
   * List of players waiting for an opponent
   */
  this.waitingPlayers = [];
  this.nbPlayersWaiting = 0;
};

Pong.prototype.init = function(port) {
  // Serve static files and let socket.io manage websocket stuff
  this.appServer = http.createServer(serveStatic.requestHandler);
  this.io = require('socket.io').listen(this.appServer);
  this.appServer.listen(port);

  // On client connection
  var that = this;
  this.io.sockets.on('connection', function(socket) {
    that.onNewClient.call(that, socket);
  });
};

/**
 * on connection handler
 */
Pong.prototype.onNewClient = function(socket) {
  var player = new Pong.Player(this, socket);
  socket.set('player', player);
  this.waitingPlayers.push(player);
  console.info('Players waiting: ' + ++this.nbPlayersWaiting);

  var that = this;
  socket.on('disconnect', function() {
    that.onClientLeft.call(that, player);
  });

  player.notifyWaiting();
};

/**
 * On client left handler
 */
Pong.prototype.onClientLeft = function(player) {
  if(player.isWaiting)
    this.removeWaitingPlayer(player);
};

/**
 * Removes a player in the waiting players list.
 * Returns true if the player has been found and removed, false otherwise.
 */
Pong.prototype.removeWaitingPlayer = function(player) {
  var i;
  for(i = 0; i < this.waitingPlayers.length; ++i) {
    if(player === this.waitingPlayers) {
      delete this.waitingPlayers[i];
      return true;
    }
  }
  return false;
};

Pong.Player = require('./player.js');

module.exports = Pong;
