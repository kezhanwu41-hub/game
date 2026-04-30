const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Serve static files from the current directory
app.use(express.static(__dirname));

// Matchmaking and Room State
let waitingQueue = [];
const rooms = {};

// Health check (used by hub to detect online mode)
app.get('/health', (req, res) => {
  res.json({ ok: true, rooms: Object.keys(rooms).length, waiting: waitingQueue.length, ts: Date.now() });
});

// Game routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/bingfa', (req, res) => res.sendFile(path.join(__dirname, 'bingfa.html')));
app.get('/huaxia', (req, res) => res.sendFile(path.join(__dirname, 'huaxia.html')));

function generateRoomId() {
  return Math.random().toString(36).substr(2, 6);
}

io.on('connection', (socket) => {
  console.log(`[CONNECT] User connected: ${socket.id}`);
  let currentRoom = null;
  let playerRole = null; // 'p1' or 'p2'

  // Join matchmaking
  socket.on('join_matchmaking', () => {
    if (waitingQueue.includes(socket)) return;
    
    console.log(`[LOBBY] ${socket.id} joined matchmaking`);
    waitingQueue.push(socket);

    if (waitingQueue.length >= 2) {
      const p1 = waitingQueue.shift();
      const p2 = waitingQueue.shift();
      
      const roomId = generateRoomId();
      rooms[roomId] = { p1: p1.id, p2: p2.id, readyCount: 0 };
      
      const p1Role = 'player1';
      const p2Role = 'player2';

      p1.join(roomId);
      p2.join(roomId);
      
      // Notify players
      p1.emit('match_found', { roomId, role: p1Role, opponent: p2.id });
      p2.emit('match_found', { roomId, role: p2Role, opponent: p1.id });
      
      currentRoom = roomId;
      playerRole = p1Role;
      
      // We set properties dynamically since sockets are bound closure-wise
      p1.currentRoom = roomId; p1.playerRole = p1Role;
      p2.currentRoom = roomId; p2.playerRole = p2Role;
      
      console.log(`[MATCH] Room ${roomId} created for ${p1.id} & ${p2.id}`);
    }
  });

  // Handle generic game actions relayed to opponent
  socket.on('game_action', (data) => {
    const roomId = socket.currentRoom;
    if (roomId && rooms[roomId]) {
      // Relay action to everyone in the room except the sender
      socket.to(roomId).emit('opponent_action', data);
    }
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    console.log(`[DISCONNECT] User disconnected: ${socket.id}`);
    
    // Remove from waiting queue
    waitingQueue = waitingQueue.filter(s => s.id !== socket.id);
    
    // Notify opponent if in a room
    if (socket.currentRoom && rooms[socket.currentRoom]) {
      socket.to(socket.currentRoom).emit('opponent_disconnected');
      delete rooms[socket.currentRoom]; // Destroy room
    }
  });
});

const PORT = process.env.PORT || 7892;
server.listen(PORT, () => {
  console.log(`[SERVER] Heroes-Formation Multiplayer Server running on http://localhost:${PORT}`);
});
