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
  /**
   * Width of the player's scene
   */
  this.width = 0;
  /**
   * Height of the player's scene
   */
  this.height = 0;

  var forwardedMessages = ['game.start', 'game.stop', 'game.update'];
  var that = this;

  forwardedMessages.forEach(function(messageName) {
    that.socket.on(messageName, function(data) {
      if(that.opponent)
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
  this.socket.emit('player.hasOpponent', {
    side: side,
    width: this.width,
    height: this.height
  });
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
