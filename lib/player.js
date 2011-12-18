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
   * Waits for an opponent
   */
  this.isWaiting = true;
};

Player.prototype.notifyWaiting = function() {
  this.socket.emit('player.wait');
};

module.exports = Player;
