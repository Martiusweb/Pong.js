/**
 * Pong.js
 * @author Martin Richard
 *
 * Pong server root
 */

var http = require('http');
var serveStatic = require('./serveStatic.js');

// Serve static files and let socket.io manage websocket stuffs
var appServer = http.createServer(serveStatic.requestHandler);
var io = require('socket.io').listen(appServer);
appServer.listen(8001);

io.sockets.on('connection', function(socket) {
  setTimeout(function() {
    socket.emit('player.moveTo', {position: 150});
  }, 300);
});
