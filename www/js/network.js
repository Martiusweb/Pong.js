/**
 * Pong.js
 * @author Martin Richard
 *
 * Methods handling network
 */

(function() {
Pong = window.Pong || {};

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
  /**
   * Prevent to resend a received stop message
   */
  this.preventEmitStop = false;

  this.connect();
};

Pong.Network.prototype.connect = function() {
  if(!this.socket)
    this.socket = io.connect('/');

  var that = this;
  this.socket.on('connect', function(data) {
    that.socket = this;
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

  if(this.pong.networkElt)
    this.pong.networkElt.text("Game started");
};

/**
 * Deactivates updates
 */
Pong.Network.prototype.deactivateUpdates = function() {
  if(!this.preventEmitStop) {
    this.socket.emit('game.stop');
  }
  this.preventEmitStop = false;
  clearInterval(this.timer);

  if(this.pong.networkElt)
    this.pong.networkElt.text("Game stopped");
};

Pong.Network.prototype.initNetworkHandlers = function() {
  // First, I send my config
  this.socket.emit('client.config', {
    width: this.pong.canvas.width,
    height: this.pong.canvas.height,
  });

  var that = this;

  /**
   * Game starts
   */
  this.socket.on('game.start', function() {
    that.pong.startGame();
  });

  /**
   * Game stops
   */
  this.socket.on('game.stop', function() {
    that.preventEmitStop = true;
    that.pong.stopGame();
  });

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

    that.pong.resizeScene(data.width, data.height);
  });

  /**
   * Other player left the game
   */
  this.socket.on('player.opponnentLeft', function(data) {
    that.hasOpponent = false;
    that.preventEmitStop = true;
    that.pong.stopGame();
    that.pong.endGame();
  });

  /**
   * Player loses!
   */
  this.socket.on('game.losePoint', function() {
    if(that.pong.networkElt)
      that.pong.networkElt.text('You lose the point!');
  });

  /**
   * Player wins!
   */
  this.socket.on('game.winPoint', function() {
    if(that.pong.networkElt)
      that.pong.networkElt.text('You win the point!');
  });

  /**
   * Receive an update of the state of the game
   */
  this.socket.on('game.update', function(data) {
    if(data.opponentPosition) {
      that.pong.opponent.moveTo(data.opponentPosition);
    }

    // Test the existance of the ball in order to prevent a race condition with
    // the server
    if(data.ball && that.pong.ball) {
      that.pong.ball.updateBallData(data.ball.x, data.ball.y, data.ball.dx,
        data.ball.dy);
    }
  });

  /**
   * Connection with server lost
   */
  this.socket.on('disconnect', function() {
    if(that.pong.networkElt)
      that.pong.networkElt.text('Disconnected');
    delete that.socket;
    that.socket = null;

    that.pong.stopGame();
  });
};

Pong.Network.prototype.sendUpdate = function() {
  if(!this.socket)
    return;

  var data = {
    player: {
      position: this.pong.player.position
    },
  };

  this.socket.emit('game.update', data);
};

/**
 * Notifies the server that the player is willing to start the game.
 */
Pong.Network.prototype.requestStartGame = function() {
  if(this.hasOpponent)
    this.socket.emit('game.start');
};

})();
