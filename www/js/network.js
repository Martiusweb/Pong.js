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
  /**
   * Prevent to resend a received start message
   */
  this.preventEmitStart = false;
  /**
   * Prevent to resend a received stop message
   */
  this.preventEmitStop = false;
  /**
   * Adds the ball data to the next update
   */
  this.sendBallData = true;

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

  if(!this.preventEmitStart) {
    this.socket.emit('game.start');
  }
  this.preventEmitStart = false;

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
    that.preventEmitStart = true;
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
    that.pong.stopGame();
    that.pong.endGame();
  });

  /**
   * Receive an update of the state of the game
   */
  this.socket.on('game.update', function(data) {
    that.pong.opponent.moveTo(data.player.position);

    if(data.ball) {
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
    that.shutdownNetworkHandlers();
    delete that.socket;
    that.socket = null;
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

  if(this.sendBallData) {
    data.ball = {
      x:  this.pong.ball.x,
      y:  this.pong.ball.y,
      dx: this.pong.ball.dx,
      dy: this.pong.ball.dy,
    };
    this.sendBallData = false;
  }

  this.socket.emit('game.update', data);
};
