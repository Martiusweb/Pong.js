/**
 * Pong.js
 * @author Martin Richard
 *
 * Definition of a player
 */

/**
 * A player (current user or opponent).
 */
Pong.Player = function(pong, player) {
  this.pong = pong;
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
  this.position = Pong._config.scene.margin;

  // Compute the right fixedPosition value (negative value means from the
  // opposite side)
  if(this.fixedPosition < 0) {
    this.fixedPosition += this.pong.canvas.width - Pong._config.handle.width;
  }
};

/**
 * Draws player handle
 */
Pong.Player.prototype.draw = function() {
  this.pong.canvasCtx.fillStyle = this.style;
  this.pong.canvasCtx.fillRect(
    this.fixedPosition,
    this.position,
    Pong._config.handle.width,
    Pong._config.handle.height
  );
};

Pong.Player.prototype.moveTo = function(position) {
  position = Math.max(position, Pong._config.scene.margin);
  var handleBottomPos = position + Pong._config.handle.height;
  var sceneBottom = this.pong.canvas.height - Pong._config.scene.margin;

  if(handleBottomPos > sceneBottom)
    position = sceneBottom - Pong._config.handle.height;

  this.position = position;

  this.pong.invalidated = true;
};

/**
 * Moves the handle of $movement$ pixels
 */
Pong.Player.prototype.moveOf = function(movement) {
  this.moveTo(this.position + movement);
};
