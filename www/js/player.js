/**
 * Pong.js
 * @author Martin Richard
 *
 * Definition of a player
 */

/**
 * A player (current user or opponent).
 */
Pong.Player = function(canvas, player) {
  this.canvas = canvas;
  /**
   * Canvas context
   */
  this.canvasCtx = this.canvas.getContext('2d');
  /**
   * Style
   */
  this.style = Pong._config.handle.playerStyle[player];
  /**
   * Position (on the axis where the handle does not move)
   */
  this.fixedPosition = Pong._config.handle.playerPosition[player];
  /**
   * Position (on the axis where the handle moves)
   */
  this.position = 10;

  // Compute the right fixedPosition value (negative value means from the
  // opposite side)
  if(this.fixedPosition < 0) {
    this.fixedPosition += canvas.width - Pong._config.handle.minWidth;
  }
};

/**
 * Draws player handle
 */
Pong.Player.prototype.draw = function() {
  this.canvasCtx.fillStyle = this.style;
  this.canvasCtx.fillRect(
    this.fixedPosition,
    this.position,
    Pong._config.handle.minWidth,
    Pong._config.handle.minHeight
  );
};

/**
 * Moves the handle of $movement$ pixels
 */
Pong.Player.prototype.moveOf = function(movement) {
  this.position += movement;
};
