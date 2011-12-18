/**
 * Pong.js
 * @author Martin Richard
 *
 * Methods handling network
 */

Pong.Network = function(pong) {
  this.pong = pong;
  /**
   * Network socket
   */
  this.socket = null;
  /**
   * Refresh timer
   */
  this.timer = null;
  /**
   * True if the player has an opponent online
   */
  this.hasOpponent = false;

  this.connect();
};

Pong.Network.prototype.connect = function() {
  if(!this.socket)
    this.socket = io.connect('/');

  var that = this;
  this.socket.on('connect', function() {
    if(that.pong.networkElt)
      that.pong.networkElt.text('Connected !');
    that.initNetworkHandlers();
  });
};

/**
 * Activates the timer with trigger the sendUpdates operation
 */
Pong.Network.prototype.activateUpdates = function() {
  var that = this;
  this.timer = window.setInterval(function() {
    that.sendUpdate.call(that);
  }, Pong._config.network.refreshDelay);
};

/**
 * Deactivates updates
 */
Pong.Network.prototype.deactivateUpdates = function() {
  clearInterval(this.timer);
};

Pong.Network.prototype.initNetworkHandlers = function() {
  var that = this;

  /**
   * Waiting for other player
   */
  this.socket.on('player.wait', function() {
    if(that.pong.networkElt)
      that.pong.networkElt.text('Waiting for an other player...');
  });

  /**
   * Other player found
   */
  this.socket.on('player.hasOpponent', function(data) {
    that.hasOpponent = true;
    if(that.pong.networkElt)
      that.pong.networkElt.text('Other player found, you play on the '+
        (data.side === Pong.Player.LEFT ? 'left' : 'right') +'!');

    if(data.side === Pong.Player.LEFT)
      that.pong.beLeftPlayer();
    else
      that.pong.beRightPlayer();
  });

  /**
   * Other player left the game
   */
  this.socket.on('player.opponnentLeft', function(data) {
    that.hasOpponent = false;
    that.pong.stopGame();
    that.pong.endGame();
  });

  /**
   * Other player moved
   */
  this.socket.on('player.moveTo', function(data) {
    that.pong.opponent.moveTo(data.position);
  });

  /**
   * Connection with server lost
   */
  this.socket.on('disconnect', function() {
    if(that.pong.networkElt)
      that.pong.networkElt.text('Disconnected');
    that.shutdownNetworkHandlers();
    delete that.socket;
    that.socket = null;
  });
};

/**
 * Shutdown network handlers on disconnection.
 */
Pong.Network.prototype.shutdownNetworkHandlers = function() {
  // TODO
};

Pong.Network.prototype.sendUpdate = function() {
  if(!this.socket)
    return;

  this.socket.emit('player.moveTo', {
    position: this.pong.player.position
  });
};
