/**
 * Pong.js
 * @author Martin Richard
 *
 * Pong server main class
 */

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

  var forwardedMessages = ['player.moveTo'];
  var that = this;

  forwardedMessages.forEach(function(messageName) {
    that.socket.on(messageName, function(data) {
      that.opponent.socket.emit(messageName, data);
    });
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
Player.prototype.notifyHasOpponent = function(opponent, side) {
  this.opponent = opponent;
  this.socket.emit('player.hasOpponent', {side: side});
};

/**
 * Oh, the other player left the game!
 */
Player.prototype.notifyOpponentLeft = function() {
  this.opponent = null;
  this.socket.emit('player.opponnentLeft');
};

Player.LEFT = 0;
Player.RIGHT = 1;

module.exports = Player;
