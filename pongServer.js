/**
 * Pong.js
 * @author Martin Richard
 *
 * Pong server root
 */

var Pong = require('./lib/pong.js');

var pong = new Pong();
pong.init(8010);
