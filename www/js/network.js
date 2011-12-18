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

/*
    this.timer = window.setInterval(function() {
      that.sendUpdate.call(that);
    }, Pong._config.network.refreshDelay);
//*/
  });
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
