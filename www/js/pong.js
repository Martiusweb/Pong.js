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
  },
  handle: {
    minWidth: 12,
    minHeight: 60,
    // Position of the player handle, indexed by player
    // If the value is negative, the position is computed according to the
    // opposite side of the canvas.
    playerPosition: [20, -20],
    playerStyle: ['#336699', '#FF9900'],
  }
};

/**
 * Helper that loads libraries, can be minified easily.
 *  - callback is called once all libraries are fetched.
 *  - does not handle loading errors
 */
var _require = function(libraries, callback) {
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
  this.canvas = document.createElement("canvas");
  /**
   * Canvas context
   */
  this.canvasCtx = this.canvas.getContext("2d");
  /**
   * Players
   */
  this.players = [];

  // Scene size
  this.canvas.width = Math.max(_config.scene.minWidth, this.wrapper.width());
  this.canvas.height = Math.max(_config.scene.minHeight, this.wrapper.height());

  // Prepare the game
  this.wrapper.append(this.canvas);

  // Initialize 2 players \o/
  this.players[0] = new Pong.Player(this.canvasCtx, 0);
//  this.players[1] = new Pong.Player(this.canvasCtx, 1);
};
Pong._config = _config;

var _bootstrap = function() {
  var pongInstance = new Pong($('#ponginstance'));
};

_require(['Player',],
  function() {
    $(document).ready(_bootstrap);
  }
);

// export Pong API
this.Pong = Pong;
})($);
