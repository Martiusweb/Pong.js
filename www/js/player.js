/**
 * Pong.js
 * @author Martin Richard
 *
 * Definition of a player
 */

/**
 * A player (current user or opponent).
 */
Pong.Player = function(canvasCtx, player) {
  /**
   * Canvas context
   */
  this.canvasCtx = canvasCtx;
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

  // Draw handle
  this.draw();
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
