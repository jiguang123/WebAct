/*
  This module is the wrapper around socket.io functionalities. Socket.IO is a real time message passing library.
  This module is written as a closure pattern.

  Need to require it in other js script to use it.
*/
function SocketioServerManager() {
  console.log('SocketioServerManager module');
  
  var fs = require('fs');
  const socketio = require('socket.io');
  var ss = require('socket.io-stream');

  /* all events of this project */
  var EVENT;
  /* event emitter from EventManager() */
  var emitter;


  const TAG = 'SocketioServerManager';

  /* The HTTP server of NodeJS */
	var httpServer;
  /* The socketio instance */
	var io;
  /* SocketIO socket */
	var mySocket;
  /* socket io streaming socket */
	var ssSocket;
  /* A flags */
	var initialized = false;

  /*
    @server: NodeJS server,
    @eventManager: instance of EventManager, when I say instance, I mean the return value of EventManager()
    init this Module for later use.
   */
	function init(server, eventManager) {
		console.log(TAG, 'init everything');
		httpServer = server;
    EVENT = eventManager.EVENT;
    emitter = eventManager.emitter;
		io = socketio(server);
		registerEvents();
	}

  /*
    register events for socketio
   */
	function registerEvents() {
    console.log(TAG, 'start to registerEvents');
		io.on('connection', function(socket) {
			console.log(TAG, 'on connection');
			mySocket = socket;
			ssSocket = ss(socket);
			initialized = true;

			// todo:
			// need to document that stream and additionalData are
			// in below callback function
			ssSocket.on(EVENT.FILE_UPLOAD, function(stream, additionalData) {
				console.log(TAG, 'on EVENT.FILE_UPLOAD');

				var bufferArray = [];
				var totalLength = 0;
				var byteLength = 0;
				var newBuffer;

				stream.on('data', function(data) {
					console.log(TAG, 'type of data:', typeof data);
					console.log(TAG, 'on data:', data.length);
					console.log(TAG, 'on data bytes:', Buffer.byteLength(data, 'binary'));
					totalLength += data.length;
					byteLength += Buffer.byteLength(data, 'binary');
					bufferArray.push(data);
				});

				stream.on('end', function() {
					newBuffer = Buffer.concat(bufferArray);
					console.log(TAG, 'on end');
					console.log(TAG, 'bufferArray.length:', bufferArray.length);
					console.log(TAG, '       totalLength:', totalLength);
					console.log(TAG, '       byte length:', byteLength);

					emitter.emit(EVENT.RECEIVED_FILE_FROM_BROWSER, bufferArray);
				});
			});

		});
	}

  /*
    @dataToSend: a binary buffer/binary array/binary string that represents an image file
    if this module is initialized, then send dataToSend to browser/front end
   */
	function send_image_to_browser(dataToSend) {
    console.log(TAG, 'send_image_to_browser');
    if(initialized) {
      console.log(TAG, 'mySocket is initialized');
	    console.log(TAG, 'length', dataToSend.length);
	    console.log(TAG, 'byte length', Buffer.byteLength(dataToSend));

	    //need to use stream
	    fs.writeFileSync('temp2.jpg', dataToSend); // debug
			mySocket.emit(EVENT.SEND_IMAGE_TO_BROWSER, {data: dataToSend});
		} else {
			console.log(TAG, 'mySocket not initialized');
		}
	}


	let publicAPI = {
		init: init,
		send_image_to_browser: send_image_to_browser
	};


  console.log('SocketioServerManager module end');
	return publicAPI;
}


module.exports.publicAPI = SocketioServerManager();
