/**
 * Pong.js
 * @author Martin Richard
 *
 * The game root class (initializes the game)
 */

(function($) {
var Pong, _config = {
  scene: {
    minWidth: 500,
    minHeight: 300,
    margin: 10,
    separatorWidth: 2,
    separatorStyle: '#999',
    separatorDashLength: 12,
    separatorGapLength: 6,
  },
  handle: {
    width: 12,
    height: 30,
    // Position of the player handle, indexed by player
    // If the value is negative, the position is computed according to the
    // opposite side of the canvas.
    playerPosition: [20, -20],
    playerStyle: ['white', 'white'],
  },
  ball: {
    radius: 4,
    style: 'white',
    refreshDelay: Math.round(1000/60), // in milliseconds
  },
};

/**
 * Helper that loads libraries, can be minified easily.
 *  - callback is called once all libraries are fetched.
 *  - does not handle loading errors
 */
var _require = function(libraries, callback) {
  if(!libraries || libraries.length == 0) {
    callback();
    return;
  }

  if(typeof(libraries) == 'string')
    libraries = [libraries];

  var nbLibrariesFetching = 0;
  var library, i;
  for(i = 0; i < libraries.length; ++i) {
    library = libraries[i];
    // Lowercase first letter
    library = library.charAt(0).toLowerCase() + library.slice(1);
    ++nbLibrariesFetching;
    $.getScript('/js/' + library + '.js', function() {
      --nbLibrariesFetching;
      if(nbLibrariesFetching == 0) {
        callback();
      }
    });
  }
};

/**
 * Pong.js
 *
 * If the element has an ID, you can display fps by adding to the dom an element
 * with the classes "fps"" and [element id], for instance, for the wrapper
 * id="ponginstance", display fps in <span class="fps ponginstance"></span>
 */
Pong = function (canvasElt) {
  /**
   * Dom element that wraps the game
   */
  this.wrapper = canvasElt;
  /**
   * Html element where to display FPS
   */
  this.fpsElt = null;
  /**
   * Last time a frame was drawn
   */
  this.lastFrameTimestamp = 0;
  /**
   * Computed FPS
   */
  this.fps = 0;
  /**
   * Canvas element where we draw the scene
   */
  this.canvas = document.createElement('canvas');
  /**
   * Canvas context
   */
  this.canvasCtx = this.canvas.getContext('2d');
  /**
   * True if the scene must be redrawn.
   */
  this.invalidated = true;
  /**
   * True if the game is in motion (we need to refresh the scene periodically)
   */
  this.isInMotion = false;
  /**
   * Players
   */
  this.players = [];
  /**
   * Ball
   */
  this.ball = null;
  /**
   * Playable player
   */
  this.player;
  /**
   * Playable player index in the players array
   */
  this.playerIdx;
  /**
   * Opponent
   */
  this.opponent;
  /**
   * Networking helper
   */
  this.network;
  /**
   * Networking state Element
   */
  this.networkElt = null;

  // Scene size
  this.canvas.width = Math.max(_config.scene.minWidth, this.wrapper.width());
  this.canvas.height = Math.max(_config.scene.minHeight, this.wrapper.height());
  // If the wrapper does not have a fixed height, a few remaining pixels may be visible
  this.wrapper.height(this.canvas.height);

  // Prepare the game
  this.wrapper.append(this.canvas);

  // Where to display debug stats
  this.findStatsDOMElements();

  // Initialize 2 players \o/
  this.players[0] = new Pong.Player(this, 0);
  this.players[1] = new Pong.Player(this, 1);
  this.player = this.players[0];
  this.opponent = this.players[1];
  this.playerIdx = 0;

  // cache horizontal middle of the scene position
  this.middleX = (this.canvas.width-_config.scene.separatorWidth)/2;

  // Prepare connexion
  this.network = new Pong.Network(this);

  this.waitUser();
};
Pong._config = _config;
// Xbrowser my love
Pong.requestAnimationFrame = window.requestAnimationFrame
  || window.mozRequestAnimationFrame
  || window.webkitRequestAnimationFrame
  || window.msRequestAnimationFrame;

/**
 * Draws the scene: handles, ball and separator.
 */
Pong.prototype.draw = function() {
  var that = this;
  var drawFrameCallback = function(when) {
    if(that.fpsElt) {
      that.fps = 1/((when-that.lastFrameTimestamp)/1000);
      that.lastFrameTimestamp = when;
      that.fpsElt.text('about ' + Math.round(that.fps)+' fps');
    }
    that.draw.call(that);
  };

  if(!this.invalidated) {
    if(this.isInMotion) {
      Pong.requestAnimationFrame.call(window, drawFrameCallback);
    }
    return;
  }
  this.invalidated = false;

  var i;

  // Clear scene
  this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);

  // Draw players
  for(i = 0; i < this.players.length; ++i) {
    this.players[i].draw();
  }

  // Draw ball
  if(this.ball) {
    this.ball.draw();
  }

  // Draw misc

  // Draw middle line
  this.canvasCtx.strokeStyle = _config.scene.separatorStyle;
  this.canvasCtx.lineWidth = _config.scene.separatorWidth;
  var draw = true, length = 0;

  this.canvasCtx.beginPath();
  this.canvasCtx.moveTo(this.middleX, 0);
  while(length < this.canvas.height) {
    if(draw) {
      // Do not go too far !
      length = Math.min(length+_config.scene.separatorDashLength, this.canvas.height);
      this.canvasCtx.lineTo(this.middleX, length);
      this.canvasCtx.stroke();
    }
    else {
      length += _config.scene.separatorGapLength;
      this.canvasCtx.moveTo(this.middleX, length);
    }
    draw = !draw;
  }

  // If in motion, we refresh at next frame
  if(this.isInMotion) {
    Pong.requestAnimationFrame.call(window, drawFrameCallback);
  }
};

/**
 * The game is not in motion and we are waiting for a user to start the game.
 */
Pong.prototype.waitUser = function() {
  // Stop refresh
  this.isInMotion = false;

  // Draw the clean scene
  this.draw();

  // Wait for user
  var that = this;
  this.wrapper.one('click', function(e) {
    that.startGame();
  });
};

/**
 * Begin the game
 */
Pong.prototype.startGame = function() {
  this.wrapper.css('cursor', 'none');

  // Move handle with cursor
  var that = this;
  this.wrapper.mousemove(function(e) {
    var wrapperOffset = that.wrapper.offset();
    that.players[0].moveTo(e.pageY - wrapperOffset.top);
  });

  // Listen to pause events
  this.wrapper.one('click', function() {
    that.stopGame();
  });

  $(document).keypress(function(e) {
    if(e.which == 32) { // Space bar
      that.stopGame();
    }
  });

  // Create ball if this is a new game
  if(this.ball == null)
    this.ball = new Pong.Ball(this);

  // Ready to update
  this.isInMotion = true;
  this.draw();

  // move the ball
  this.ball.animate();
};

/**
 * Stop pauses the game action, it's not the end of the game.
 */
Pong.prototype.stopGame = function() {
  this.ball.stop();

  this.wrapper.css('cursor', 'auto');

  // Stop trying to move handle, wait for pause
  this.wrapper.unbind('mousemove');
  this.wrapper.unbind('keypress');
  this.wrapper.unbind('click');

  // Wait for the user to start the game
  this.waitUser();
};

/**
 * Ends the game (reinitialize the game).
 */
Pong.prototype.endGame = function() {
  delete this.ball;
  this.ball = null;
}

/**
 * Ball is out
 */
Pong.prototype.ballIsOut = function() {
  this.stopGame();
  this.endGame();
};

/**
 * Tries to find DOM Element in where we will display traces about Pong status.
 */
Pong.prototype.findStatsDOMElements = function() {
  this.fpsElt = $('.fps.' + this.wrapper.attr('id'));
  if(!this.fpsElt.length)
    this.fpsElt == null;
  this.networkElt = $('.network.' + this.wrapper.attr('id'));
  if(!this.networkElt.length)
    this.networkElt = null;
};

var _bootstrap = function() {
  var pongInstance = new Pong($('#ponginstance'));
};

_require([/*'Player', 'Ball', 'Network', */],
  function() {
    $(document).ready(_bootstrap);
  }
);

// export Pong API
this.Pong = Pong;
})($);
