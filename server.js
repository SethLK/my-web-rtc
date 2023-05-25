const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');


const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});

app.use('/peerjs', peerServer); 

app.set("view engine", "ejs");
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

var name = ''; // defining "name" in the global scope
let id = Math.round(Math.random() * 100000000 + 1);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/host', (req, res) => {
  name = req.query.name;
  res.redirect(`/room/${id}`);
});

app.get('/join', (req, res) => {
  name = req.query.name;
  roomId = req.query.room
  res.redirect(`/room/${roomId}`);
});

// Define the delay time in milliseconds
// const redirectDelay = 3000;

// app.get('/room/:room', (req, res) => {
//   const roomId = req.params.room;
//   if (roomId === id.toString()) {
//     res.render('room', { roomId, Myname: name });
//   } else {
//     setTimeout(() => {
//       res.redirect('/');
//     }, redirectDelay);
//   }
// });

app.get('/room/:room', (req, res) => {
  const roomId = req.params.room;
  if (roomId === id.toString()) {
    res.render('room', { roomId, Myname: name });
  } else {
    res.redirect('/');
  }
});



io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.broadcast.to(roomId).emit('user-connected', userId)
    console.log(`${userId} is joined to ${roomId}`)

    socket.on('disconnect', () => {
      socket.broadcast.to(roomId).emit('user-disconnected', userId)
      console.log(`${userId} is disconnected to ${roomId}`)
    })
  })
})
server.listen(3000, () => {
    console.log(`Server started on port 3000`);
});

