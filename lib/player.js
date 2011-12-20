/**
 * Pong.js
 * @author Martin Richard
 *
 * Pong Player class
 */

var Game;
var _config = require('../www/js/_config.js');

/**
 * A player !
 */
var Player = function(pong, socket) {
  this.pong = pong;
  /**
   * Client socket
   */
  this.socket = socket;
  /**
   * Opponent
   */
  this.opponent = null;
  /**
   * Width of the player's scene
   */
  this.width = 0;
  /**
   * Height of the player's scene
   */
  this.height = 0;
  /**
   * Position of the player on the scene.
   */
  this.position = 0;
  /**
   * Fixed position of the player on the scene. Known when a game starts
   */
  this.fixedPosition = 0;

  /**
   * Game the player is in
   */
  this.game = null;

  var that = this;

  this.socket.on('client.config', function(data) {
    if(!data.width || !data.height)
      return;

    that.width = data.width|0;
    that.height = data.height|0;

    that.pong.lookForOpponent(that);
  });

  this.socket.on('game.start', function() {
    that.game.start();
  });

  this.socket.on('game.stop', function() {
    that.game.stop();
  });

  this.socket.on('game.update', function(data) {
    that.position = data.player.position;
  });
};

/**
 * User waits for a peer
 */
Player.prototype.notifyWaiting = function() {
  this.socket.emit('player.wait');
};

/**
 * User has a peer
 */
Player.prototype.notifyHasOpponent = function(game, opponent, side) {
  this.opponent = opponent;
  this.game = game;

  this.socket.emit('player.hasOpponent', {
    side: side,
    width: this.game.sceneWidth,
    height: this.game.sceneHeight,
  });

  // Set fixed position
  if(side === Player.LEFT) {
    this.fixedPosition = _config.handle.playerPosition[Player.LEFT];
  }
  else {
    this.fixedPosition = this.game.sceneWidth - _config.handle.playerPosition[Player.LEFT];
  }
};

/**
 * Oh, the other player left the game!
 */
Player.prototype.notifyOpponentLeft = function() {
  this.opponent = null;
  this.game = null;
  this.socket.emit('player.opponnentLeft');
};

/**
 * The game starts!
 */
Player.prototype.notifyGameStarts = function() {
  this.socket.emit('game.start');
};

/**
 * The game stops!
 */
Player.prototype.notifyGameStops = function() {
  this.socket.emit('game.stop');
};

/**
 * Player wins!
 */
Player.prototype.notifyWinPoint = function() {
  this.socket.emit('game.winPoint');
};

/**
 * Player loses!
 */
Player.prototype.notifyLosePoint = function() {
  this.socket.emit('game.losePoint');
};

/**
 * Send updates of the game
 */
Player.prototype.sendUpdate = function(data) {
  this.socket.volatile.emit('game.update', data);
};

Player.LEFT = 0;
Player.RIGHT = 1;

module.exports = Player;
