const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files (e.g., HTML, CSS, JS)
app.use(express.static(__dirname));

// Handle socket connections
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join a game room
    socket.on('joinGame', (gameId) => {
        socket.join(gameId);
        console.log(`User ${socket.id} joined game ${gameId}`);

        // Notify other players in the room
        socket.to(gameId).emit('playerJoined', socket.id);
    });

    // Handle moves
    socket.on('move', (gameId, move) => {
        console.log(`Move in game ${gameId}:`, move);
        socket.to(gameId).emit('opponentMove', move);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});