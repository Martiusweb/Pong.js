/**
 * Pong.js
 * @author Martin Richard
 *
 * Pong server main class
 */

var http = require('http');
var serveStatic = require('./serveStatic.js');
Game = require('./game.js');

var Pong = function() {
  /**
   * Http server for the game
   */
  this.appServer = null;
  /**
   * socket.io object
   */
  this.io = null;
  /**
   * List of players waiting for an opponent
   */
  this.waitingPlayer = null;
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

  this.io.set('log level', 1);
};

/**
 * on connection handler
 */
Pong.prototype.onNewClient = function(socket) {
  var player = new Player(this, socket);
  socket.set('player', player);

  var that = this;
  socket.on('disconnect', function() {
    that.onClientLeft.call(that, player);
  });

  // Now we wait the user to provide its configuration
  // then Player instance will start to look for the opponent
};

/**
 * On client left handler
 */
Pong.prototype.onClientLeft = function(player) {
  if(this.waitingPlayer === player)
    this.waitingPlayer = null;
  // Player not waiting and without opponent is a player who did not send its
  // configuration (client.config)
  else if(player.opponent) {
    player.game.playerLeft(player);

    var found = this.lookForOpponent(player.opponent);
  }
};

/**
 * Add the player to the waiting list and notify it.
 */
Pong.prototype.addWaitingPlayer = function(player) {
  this.waitingPlayer = player;
  player.notifyWaiting();
};

/**
 * Look for a peer to play with.
 *
 * Returns true if a peer had been found, false otherwise.
 */
Pong.prototype.lookForOpponent = function(player) {
  if(this.waitingPlayer !== null) {

    // Create new game
    var game = new Game(this.pong, [player, this.waitingPlayer]);

    player.notifyHasOpponent(game, this.waitingPlayer, Player.LEFT);
    this.waitingPlayer.notifyHasOpponent(game, player, Player.RIGHT);
    this.waitingPlayer = null;
    return true;
  }
  this.addWaitingPlayer(player);
  return false;
};

Player = require('./player.js');

module.exports = Pong;
