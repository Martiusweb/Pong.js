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

Pong.Network.prototype.initNetworkHandlers = function() {
  var that = this;
  this.socket.on('player.moveTo', function(data) {
    that.pong.opponent.moveTo(data.position);
  });
};
