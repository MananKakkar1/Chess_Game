const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files (e.g., HTML, CSS, JS)
app.use(express.static(__dirname));

// Store game states
const games = {};

// Handle socket connections
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join a game room
    socket.on('joinGame', (gameId) => {
        socket.join(gameId);
        console.log(`User ${socket.id} joined game ${gameId}`);

        // Initialize game state if it doesn't exist
        if (!games[gameId]) {
            games[gameId] = {
                boardState: initializeBoard(),
                currentPlayer: 'white',
            };
        }

        // Notify other players in the room
        socket.to(gameId).emit('playerJoined', socket.id);
    });

    // Handle moves
    socket.on('move', (gameId, move) => {
        console.log(`Move in game ${gameId}:`, move);
         // Validate the move
         const game = games[gameId];
         if (validateMove(game.boardState, move, game.currentPlayer)) {
             // Update the board state
             updateBoard(game.boardState, move);
 
             // Switch the current player
             game.currentPlayer = game.currentPlayer === 'white' ? 'black' : 'white';
 
             // Broadcast the move to other players
             socket.to(gameId).emit('opponentMove', move);
         } else {
             console.log('Invalid move:', move);
         }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

function initializeBoard() {
    return [
        ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
        ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
        ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖'],
    ];
}

function validateMove(boardState, move, currentPlayer) {
    // Add logic to validate the move based on the board state and current player
    return true; // Placeholder
}

function updateBoard(boardState, move) {
    const { fromRow, fromCol, toRow, toCol } = move;
    boardState[toRow][toCol] = boardState[fromRow][fromCol];
    boardState[fromRow][fromCol] = null;
}

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});