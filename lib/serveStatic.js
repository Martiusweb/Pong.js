/**
 * Pong.js
 * @author Martin Richard
 *
 * Serve static files of the game.
 */

var path = require('path');
var fs = require('fs');

var _config = {
  root: './www',
  encoding: 'utf-8',
  contentType: {
    'html': 'text/html',
    'htm': 'text/html',
    'js': 'text/javascript',
    'css': 'text/css',
  }
};


exports.requestHandler = function(request, response) {
  // Prepare request URL
  var filePath = _config.root + request.url;

  // Strip query String
  var qmarkPos = filePath.lastIndexOf('?');
  if(qmarkPos != -1) {
    filePath = filePath.substr(0, qmarkPos);
  }

  // Default index
  if(request.url.slice(-1) == '/')
    filePath += 'index.html';

  console.log("static: " + request.url + "\nR:\tserving " + filePath);

  var _readFile = function(error, content) {
    if(error) {
      response.writeHead(500);
      response.end();
      return;
    }

    var fileExtension = filePath.slice(filePath.lastIndexOf('.')+1).toLowerCase();
    response.writeHead(200, {
      'Content-Type': _config.contentType[fileExtension],
    });
    response.end(content, _config.encoding);
  };

  var _statFile = function(exists) {
    if(!exists) {
      response.writeHead(404);
      response.end();
      return;
    }

    fs.readFile(filePath, _readFile);
  };

  path.exists(filePath, _statFile);
};
