/**
 * Pong.js
 * @author Martin Richard
 *
 * Configuration
 */

(function() {

var _config = {
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
    refreshDelay: 20, // in milliseconds
    startX: 50,
    startY: 50,
    startDx: 3,
    startDy: 2,
  },
  network: {
    refreshDelay: Math.round(1000/60), // in milliseconds
    refreshTicks: 5, // in number of Ticks 0 = always
  },
};

// Export to node.js or browser-Pong scope
if(typeof(module) !== 'undefined') {
  module.exports = _config;
}
else {
  Pong._config = _config;
}

})();
