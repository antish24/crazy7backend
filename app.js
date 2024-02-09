const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
require('dotenv').config();
const cors = require('cors');
const db = require('./config/db');
const config = require('./config/index');

const app = express();
const path = require('path');
app.use(cors());
const routes=require('./routes/indexRoute')
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    // origin: 'http://localhost:3000',
    origin: 'https://crazy7.vercel.app',
    methods: ['GET', 'POST'],
    allowedHeaders: ['my-custom-header'],
    credentials: true,
  },
});

// Connect to MongoDB
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {
  console.log('MongoDB connection successful');
});

// Socket.IO event handling
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

  socket.on('close game', (data) => {
    console.log('back message:', data);
    io.emit('closed game', data);
  });

  socket.on('player kicked', (data) => {
    console.log('back message:', data);
    io.emit('new player', data);
  });

  socket.on('start game', (data) => {
    console.log('back message:', data);
    io.emit('go to game', data);
  });

  socket.on('draw card', (data) => {
    console.log('back message:', data);
    io.emit('drawed card', data);
  });

  socket.on('drop card', (data) => {
    console.log('back message:', data);
    io.emit('droped card', data);
  });

  socket.on('change turn', (data) => {
    console.log('back message:', data);
    io.emit('game turn', data);
  });

  socket.on('disconnect', () => {
    console.log('A client disconnected');
  });
});

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
app.use('/', routes);

const PORT = config.PORT || 8800;
server.listen(PORT, () => {
  console.log('Server is running on port', PORT);
});