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
  this.dx = 0;
  this.dy = 0;
  /**
   * Radius of the ball
   */
  this.r = Pong._config.ball.radius;
  /**
   * Style of the ball
   */
  this.style = Pong._config.ball.style;
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
 * Move the ball
 */
Pong.Ball.prototype.move = function() {
  this.x += dx;
  this.y += dy;
  this.pong.draw();
}
