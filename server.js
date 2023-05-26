// server.js

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.use('/peerjs', peerServer);

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

let defaultName = ''; // defining "name" in the global scope
let id = Math.round(Math.random() * 100000000 + 1);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/host', (req, res) => {
  defaultName = req.query.name;
  res.redirect(`/room/${id}`);
});

app.get('/join', (req, res) => {
  defaultName = req.query.name;
  roomId = req.query.room;
  res.redirect(`/room/${roomId}`);
});

app.get('/room/:room', (req, res) => {
  const roomId = req.params.room;
  if (roomId === id.toString()) {
    res.render('room', { roomId, Myname: defaultName });
  } else {
    res.redirect('/');
  }
});

io.on('connection', (socket) => {
  socket.on('join-room', (roomId, userId, myname) => {
    socket.join(roomId);
    socket.broadcast.to(roomId).emit('user-connected', userId, myname);

    console.log(`${myname} ${userId} has joined ${roomId}`);

    socket.on('disconnect', () => {
      socket.broadcast.to(roomId).emit('user-disconnected', userId, myname);
      console.log(`${myname} ${userId} has disconnected from ${roomId}`);
    });
  });

  // Event handler for 'tellName' event
  socket.on('tellName', (myname, roomId) => {
    socket.broadcast.to(roomId).emit("AddName", myname);
    console.log(`Received name: ${myname} from socket ${socket.id}`);
  });
});

server.listen(3000, () => {
  console.log('Server started on port 3000');
});
