const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const cors = require('cors')
const _ = require('lodash');
app.use(cors)
app.use('/', express.static('public'))
app.get('/',(req,res,next)=>{
    res.send('hello server')
})

let rooms = {
    active : {
        roomId : 100
    }
}


const getApiAndEmit = socket => {
    const response = new Date();
    // Emitting a new message. Will be consumed by the client
    socket.emit("FromAPI", response);
    console.log('emiting',response)
};  



io.on('connection', (socket) => {

    console.log('Connection has joined')
    getApiAndEmit(socket)
    
    socket.on('join',(data)=>{
    let roomId = data.roomId;
    console.log(data,roomId,data.roomId,data.username)

    console.log('Username ' + data.username + 'ID ' + data.roomId);
      const roomClients = io.sockets.adapter.rooms.get(`${roomId}`) || { length: 0 }
      const numberOfClients = _.size(roomClients);
      if (numberOfClients == 0) {
        console.log(`Creating room ${roomId} and emitting room_created socket event`)
        socket.join(roomId)
        socket.emit('room_created', roomId)
      } else if (numberOfClients == 1) {
        console.log(`Joining room ${roomId} and emitting room_joined socket event`)
        socket.join(roomId)
        socket.emit('room_joined', roomId)
      }
      console.log('$$$$$$$$',io.sockets.adapter)
      console.log('$$$$$$$$',io.sockets.adapter.rooms.get(`${roomId}`),io.sockets.adapter.rooms)
    //   let temp = io.sockets.adapter.rooms.get('500');
    //   console.log('temp',temp,_.size(temp));
    
    })

    // These events are emitted to all the sockets connected to the same room except the sender.
    socket.on('start_call', (roomId) => {
      console.log(`Broadcasting start_call event to peers in room ${roomId}`)
      socket.broadcast.to(roomId).emit('start_call')
    })


    socket.on('webrtc_offer', (event) => {
      console.log(`Broadcasting webrtc_offer event to peers in room ${event.roomId}`)
      socket.broadcast.to(event.roomId).emit('webrtc_offer', event.sdp)
    })
    socket.on('webrtc_answer', (event) => {
      console.log(`Broadcasting webrtc_answer event to peers in room ${event.roomId}`)
      socket.broadcast.to(event.roomId).emit('webrtc_answer', event.sdp)
    })
    socket.on('webrtc_ice_candidate', (event) => {
      console.log(`Broadcasting webrtc_ice_candidate event to peers in room ${event.roomId}`)
      socket.broadcast.to(event.roomId).emit('webrtc_ice_candidate', event)
    })
})
  



// START THE SERVER ==========================================================
const port = process.env.PORT || 3005
server.listen(port, () => {
  console.log(`Express server listening on port ${port}`)
})
