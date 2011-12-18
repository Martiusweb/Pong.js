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
    separatorWidth: 2,
    separatorStyle: '#999',
    separatorDashLength: 12,
    separatorGapLength: 6,
  },
  handle: {
    minWidth: 12,
    minHeight: 30,
    // Position of the player handle, indexed by player
    // If the value is negative, the position is computed according to the
    // opposite side of the canvas.
    playerPosition: [20, -20],
    playerStyle: ['white', 'white'],
  }
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
 */
Pong = function (canvasElt) {
  /**
   * Dom element that wraps the game
   */
  this.wrapper = canvasElt;
  /**
   * Canvas element where we draw the scene
   */
  this.canvas = document.createElement('canvas');
  /**
   * Canvas context
   */
  this.canvasCtx = this.canvas.getContext('2d');
  /**
   * Players
   */
  this.players = [];

  // Scene size
  this.canvas.width = Math.max(_config.scene.minWidth, this.wrapper.width());
  this.canvas.height = Math.max(_config.scene.minHeight, this.wrapper.height());
  // If the wrapper does not have a fixed height, a few remaining pixels may be visible
  this.wrapper.height(this.canvas.height);

  // Prepare the game
  this.wrapper.append(this.canvas);

  // Initialize 2 players \o/
  this.players[0] = new Pong.Player(this.canvas, 0);
  this.players[1] = new Pong.Player(this.canvas, 1);

  // cache horizontal middle of the scene position
  this.middleX = (this.canvas.width-_config.scene.separatorWidth)/2;

  // draw scene
  this.draw();
};
Pong._config = _config;

Pong.prototype.draw = function() {
  var i;
  // Draw players
  for(i = 0; i < this.players.length; ++i) {
    this.players[i].draw();
  }

  // Draw ball

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
};



var _bootstrap = function() {
  var pongInstance = new Pong($('#ponginstance'));
};

_require([/*'Player',*/],
  function() {
    $(document).ready(_bootstrap);
  }
);

// export Pong API
this.Pong = Pong;
})($);
