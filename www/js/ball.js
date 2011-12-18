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
  this.dx = -2;
  this.dy = 1;
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
  if(this.timer != null)
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
  if(this.timer == null)
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
 */
Pong.Ball.prototype.move = function() {
  this.x += this.dx;
  this.y += this.dy;

  // Collision with borders : Bounce!
  // Top
  if((this.y-this.r) <= Pong._config.scene.margin) {
    this.y = Pong._config.scene.margin+this.r;
    this.dy = -this.dy;
  }
  // Bottom
  var canvasBottomMarginPos = this.pong.canvas.height - Pong._config.scene.margin;
  if((this.y+this.r) >= canvasBottomMarginPos) {
    this.y = canvasBottomMarginPos-this.r;
    this.dy = -this.dy;
  }

  // Go out left/right borders
  // Detection is made only on the side of the player, balls lost or bounced by
  // the opponent are aknowledged by the network
  var player, handleBoundaryPos, inVerticalBoundaries;
  if(this.pong.player == 0 && this.x < this.pong.middleX) { // left side
    player = this.pong.players[0];
    handleBoundaryPos = player.fixedPosition+Pong._config.handle.width;

    if((this.x-this.r) <= handleBoundaryPos) { // on the extreme left ?
      if(this.x <= Pong._config.scene.margin) { // out of scene
        this.pong.ballIsOutLeft();
      }
      else {
        inVerticalBoundaries = (this.y >= player.position)
          && (this.y <= (player.position+Pong._config.handle.height));

        if(inVerticalBoundaries) {
          this.x = handleBoundaryPos+this.r;
          this.dx = -this.dx;
        }
      }
    }
  }
  else if(this.pong.player == 1) { // right side
    player = this.pong.players[1];
    handleBoundaryPos = player.fixedPosition;
    if((this.x+this.r) >= handleBoundaryPos) {
      if(this.x >= (this.pong.canvas.width + Pong._config.scene.margin)) {
        this.pong.ballIsOutRight();
      }
      else {
        inVerticalBoundaries = (this.y >= player.position)
          && (this.y <= (player.position+Pong._config.handle.height));

        if(inVerticalBoundaries) {
          this.x = handleBoundaryPos-this.r;
          this.dx = -this.dx;
        }
      }
    }
  }

  // Redraw
  this.pong.draw();
};
