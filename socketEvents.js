exports = module.exports = function(io) {  
  // Set socket.io listeners.
  io.on('connection', (socket) => {
    //console.log('a user connected');

    socket.on('new message', (conversation) => {
      io.sockets.in(conversation).emit('refresh messages', conversation);
      });

    socket.on('disconnect', () => {
      //console.log('user disconnected');
    });
  });
}