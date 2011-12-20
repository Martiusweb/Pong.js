/**
 * Pong.js
 * @author Martin Richard
 *
 * A game
 */

var Ball = require('./ball.js');
var _config = require('../www/js/_config.js');
var Player = require('./player.js');

// TODO maybe the game shall compute latency with the two players ?
var Game = function(pong, players) {
  this.pong = pong;
  /**
   * Players of the game
   */
  this.players = players;
  /**
   * True if the game is running, false otherwise.
   */
  this.started = false;
  /**
   * Ball of the game
   */
  this.ball = null;
  /**
   * Width of the scene
   */
  this.sceneWidth = Math.min(players[Player.LEFT].width, players[Player.RIGHT].width);
  /**
   * Height of the scene
   */
  this.sceneHeight = Math.min(players[Player.LEFT].height, players[Player.RIGHT].height);
  /**
   * Update timer
   */
  this.timer = null;
};

/**
 * Starts the game
 */
Game.prototype.start = function() {
  // Create the ball if it doesn't exists yet
  if(!this.ball)
    this.ball = new Ball(this.pong, this);

  this.started = true;

  // Notify players
  this.players[Player.LEFT].notifyGameStarts();
  this.players[Player.RIGHT].notifyGameStarts();

  this.ball.animate();

  var that = this;

  this.timer = setInterval(function(e) {
    that.update.call(that, e);
  }, _config.network.refreshDelay);
};

/**
 * Stops (pauses) the game
 */
Game.prototype.stop = function(playerLeft) {
  if(!this.started)
    return;

  playerLeft = playerLeft||false;
  if(!playerLeft || playerLeft !== this.players[Player.LEFT])
    this.players[Player.LEFT].notifyGameStops();
  if(!playerLeft || playerLeft !== this.players[Player.RIGHT])
    this.players[Player.RIGHT].notifyGameStops();

  this.ball.stop();

  clearInterval(this.timer);
  this.timer = null;
  this.started = false;
};

/**
 * Refresh data of the clients
 */
Game.prototype.update = function(e) {
  var data_player0, data_player1, data = {
    ball: {
      x:  this.ball.x,
      y:  this.ball.y,
      dx: this.ball.dx,
      dy: this.ball.dy,
    },
    opponentPosition: this.players[Player.RIGHT].position,
  };

  this.players[Player.LEFT].sendUpdate(data);

  data.opponentPosition = this.players[Player.LEFT].position;
  this.players[Player.RIGHT].sendUpdate(data);
};

/**
 * A player left the game
 */
Game.prototype.playerLeft = function(player) {
  player.opponent.notifyOpponentLeft();
  this.stop(player);
};

/**
 * What happends when the ball is out ?
 */
Game.prototype.ballIsOut = function(side) {
  this.stop();
  this.ball = null; // destroy the ball : prepare new game!

  var winner = (side == Player.LEFT ? Player.RIGHT : Player.LEFT);
  var loser = side;

  this.players[winner].notifyWinPoint();
  this.players[loser].notifyLosePoint();
};

module.exports = Game;
