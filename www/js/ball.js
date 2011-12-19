/**
 * Pong.js
 * @author Martin Richard
 *
 * Definition of the ball of the game
 */

/**
 * The ball
 */
Pong.Ball = function(pong) {
  this.pong = pong;
  /**
   * Position of the center of the ball
   */
  this.x = 50;
  this.y = 50;
  /**
   * Movement
   */
  this.dx = 5;
  this.dy = 3;
  /**
   * Radius of the ball
   */
  this.r = Pong._config.ball.radius;
  /**
   * Style of the ball
   */
  this.style = Pong._config.ball.style;
  /**
   * Timer ID (intervalID)
   */
  this.timer = null;
  /**
   * Nb of ticks since the last time when ball position had been sent
   */
  this.nbTicks = 0;
};

/**
 * Draws the ball
 */
Pong.Ball.prototype.draw = function() {
  this.pong.canvasCtx.beginPath();
  this.pong.canvasCtx.arc(this.x, this.y, this.r, 0, Math.PI*2);
  this.pong.canvasCtx.closePath();
  this.pong.canvasCtx.fillStyle = this.style;
  this.pong.canvasCtx.fill();
};

/**
 * Automates the ball movement update
 */
Pong.Ball.prototype.animate = function() {
  if(this.timer !== null)
    return;

  var that = this;
  this.timer = window.setInterval(function(e) {
    that.onTick.call(that, e);
  }, Pong._config.ball.refreshDelay);
};

/**
 * Stops the animation of the ball
 */
Pong.Ball.prototype.stop = function() {
  if(this.timer === null)
    return;

  window.clearInterval(this.timer);
  this.timer = null;
};

/**
 * Callback responding to timer ticks.
 */
Pong.Ball.prototype.onTick = function(e) {
  this.move();
};

/**
 * Move the ball
 *
 * The ball position will be synchronized each _config.network.refreshTicks or
 * when it bounces.
 */
Pong.Ball.prototype.move = function() {
  ++this.nbTicks;

  this.x += this.dx;
  this.y += this.dy;

  // Collision with borders : Bounce!
  // Top
  if((this.y-this.r) <= Pong._config.scene.margin) {
    this.y = Pong._config.scene.margin+this.r;
    this.dy = -this.dy;
    this.sendBallData();
  }
  // Bottom
  else {
    var canvasBottomMarginPos = this.pong.canvas.height - Pong._config.scene.margin;
    if((this.y+this.r) >= canvasBottomMarginPos) {
      this.y = canvasBottomMarginPos-this.r;
      this.dy = -this.dy;
      this.sendBallData();
    }
  }

  // Go out left/right borders
  // Detection is made only on the side of the player, balls lost or bounced by
  // the opponent are aknowledged by the network
  var player, handleBoundaryPos, inVerticalBoundaries;
  if(this.pong.playerIdx === Pong.Player.LEFT && this.x < this.pong.middleX) { // left side
    player = this.pong.player;
    handleBoundaryPos = player.fixedPosition+Pong._config.handle.width;

    if((this.x-this.r) <= handleBoundaryPos) { // on the extreme left ?
      if(this.x <= Pong._config.scene.margin) { // out of scene
        this.pong.ballIsOut();
      }
      else {
        inVerticalBoundaries = (this.y >= player.position) &&
          (this.y <= (player.position+Pong._config.handle.height));

        if(inVerticalBoundaries) {
          this.x = handleBoundaryPos+this.r;
          this.dx = -this.dx;
          this.sendBallData();
        }
      }
    }

    this.tryToSendBallData();
  }
  else if(this.pong.playerIdx === Pong.Player.RIGHT && this.x > this.pong.middleX) { // right side
    player = this.pong.player;
    handleBoundaryPos = player.fixedPosition;
    if((this.x+this.r) >= handleBoundaryPos) {
      if(this.x >= (this.pong.canvas.width + Pong._config.scene.margin)) {
        this.pong.ballIsOut();
      }
      else {
        inVerticalBoundaries = (this.y >= player.position) &&
          (this.y <= (player.position+Pong._config.handle.height));

        if(inVerticalBoundaries) {
          this.x = handleBoundaryPos-this.r;
          this.dx = -this.dx;
          this.sendBallData();
        }
      }
    }
    this.tryToSendBallData();
  }

  // Redraw
  this.pong.invalidated = true;
};

/**
 * Request the network to update the ball state over network.
 */
Pong.Ball.prototype.sendBallData = function() {
  this.nbTicks = 0;
  this.pong.network.sendBallData = true;
};

/**
 * Send updates if the limit of ticks had been reached.
 */
Pong.Ball.prototype.tryToSendBallData = function() {
  if(this.nbTicks >= Pong._config.network.refreshTicks) {
    this.sendBallData();
  }
};

/**
 * Update the position and the movement of the ball.
 */
Pong.Ball.prototype.updateBallData = function(x, y, dx, dy) {
  this.x  = x;
  this.y  = y;
  this.dx = dx;
  this.dy = dy;
  this.nbTicks = 0;
};
