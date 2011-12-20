/**
 * Pong.js
 * @author Martin Richard
 *
 * The ball of the game
 */

var _config = require('../www/js/_config.js');
var Player = require('./player.js');

var Ball = function(pong, game) {
  this.pong = pong;
  this.game = game;
  /**
   * Position of the center of the ball
   */
  this.x = _config.ball.startX;
  this.y = _config.ball.startY;
  /**
   * Movement
   */
  this.dx = _config.ball.startDx;
  this.dy = _config.ball.startDy;
  /**
   * Ball radius
   */
  this.r = _config.ball.radius;
  /**
   * Refresh timer
   */
  this.timer = null;
};

Ball.prototype.animate = function() {
  if(this.timer !== null)
    return;

  var that = this;
  this.timer = setInterval(function() {
    that.move.call(that);
  }, _config.ball.refreshDelay);
};

Ball.prototype.stop = function() {
  if(this.timer === null)
    return;

  clearInterval(this.timer);
  this.timer = null;
};

Ball.prototype.move = function() {
  this.x += this.dx;
  this.y += this.dy;

  // Collision with borders : Bounce!
  // Top
  if((this.y-this.r) <= _config.scene.margin) {
    this.y = _config.scene.margin+this.r;
    this.dy = -this.dy;
  }
  // Bottom
  else {
    var canvasBottomMarginPos = this.game.sceneHeight - _config.scene.margin;
    if((this.y+this.r) >= canvasBottomMarginPos) {
      this.y = canvasBottomMarginPos-this.r;
      this.dy = -this.dy;
    }
  }

  // Left and right borders
  // Left
  var handleBoundaryPos, inVerticalBoundaries, player;

  player = this.game.players[Player.LEFT];
  handleBoundaryPos = player.fixedPosition + _config.handle.width;
  if((this.x-this.r) <= handleBoundaryPos) { // on the extreme left ?
    if(this.x <= _config.scene.margin) { // out of scene
      this.game.ballIsOut(Player.LEFT);
    }
    else {
      inVerticalBoundaries = (this.y >= player.position) &&
        (this.y <= (player.position+_config.handle.height));

      if(inVerticalBoundaries) {
        this.x = handleBoundaryPos+this.r;
        this.dx = -this.dx;
        // Force update of the position
        this.game.update();
      }
    }
  }
  // Right
  else {
    player = this.game.players[Player.RIGHT];
    handleBoundaryPos = player.fixedPosition;
    if((this.x+this.r) >= handleBoundaryPos) {
      if(this.x >= (this.game.sceneWidth + _config.scene.margin)) {
        this.game.ballIsOut(Player.RIGHT);
      }
      else {
        inVerticalBoundaries = (this.y >= player.position) &&
          (this.y <= (player.position + _config.handle.height));

        if(inVerticalBoundaries) {
          this.x = handleBoundaryPos - this.r;
          this.dx = -this.dx;
          // Force update of the position
          this.game.update();
        }
      }
    }
  }
};

module.exports = Ball;
