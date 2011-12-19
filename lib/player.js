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

  // true = volatile
  var forwardedMessages = {
    'game.start': false,
    'game.stop': false,
    'game.update': true,
  };

  var that = this;
  for(messageName in forwardedMessages) {
    (function(messageName) {
      that.socket.on(messageName, function(data) {
        if(that.opponent) {
          var sock = that.opponent.socket;
          if(forwardedMessages[messageName])
            sock = sock.volatile;
          that.opponent.socket.emit(messageName, data);
        }
      });
    })(messageName);
  }

  this.socket.on('client.config', function(data) {
    if(!data.width || !data.height)
      return;

    that.width = data.width|0;
    that.height = data.height|0;

    that.pong.lookForOpponent(that);
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
    width: Math.min(this.opponent.width, this.width),
    height: Math.min(this.opponent.height, this.height),
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
