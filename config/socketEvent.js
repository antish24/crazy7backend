module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('A client connected');
  
    socket.on('new message', (data) => {
      console.log('back message:', data);
      io.emit('get new message', data);
    });
  
    socket.on('player join', (data) => {
      console.log('back message:', data);
      io.emit('new player', data);
    });
  
    socket.on('player kicked', (data) => {
      console.log('back message:', data);
      io.emit('new player', data);
    });
  
    socket.on('disconnect', () => {
      console.log('A client disconnected');
    });
  });
  };