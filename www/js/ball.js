/**
 * Pong.js
 * @author Martin Richard
 *
 * Definition of the ball of the game
 */

(function() {
Pong = window.Pong || {};

/**
 * The ball
 */
Pong.Ball = function(pong) {
  this.pong = pong;
  /**
   * Position of the center of the ball
   */
  this.x = Pong._config.ball.startX;
  this.y = Pong._config.ball.startY;
  /**
   * Movement
   */
  this.dx = Pong._config.ball.startDx;
  this.dy = Pong._config.ball.startDy;
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
 * Update the position and the movement of the ball.
 */
Pong.Ball.prototype.updateBallData = function(x, y, dx, dy) {
  this.x  = x;
  this.y  = y;
  this.dx = dx;
  this.dy = dy;
  this.pong.invalidated = true;
};

})();
