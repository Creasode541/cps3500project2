const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

const ROWS = 6;
const COLS = 7;
let board = new Array(ROWS).fill().map(() => new Array(COLS).fill(0));
let currentPlayer = 1;

const players = {};
let playerCount = 0;

function getLowestEmptyIndex(col) {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === 0) {
      return row;
    }
  }
  return -1;
}

function checkForWin(row, col, player) {
  // check horizontally
  let count = 0;
  for (let i = 0; i < COLS; i++) {
    if (board[row][i] === player) {
      count++;
      if (count === 4) {
        return true;
      }
    } else {
      count = 0;
    }
  }

  // check vertically
  count = 0;
  for (let i = 0; i < ROWS; i++) {
    if (board[i][col] === player) {
      count++;
      if (count === 4) {
        return true;
      }
    } else {
      count = 0;
    }
  }

  // check diagonal \
  count = 0;
  const offset = row - col;
  for (let i = 0; i < ROWS; i++) {
    const j = i - offset;
    if (j >= 0 && j < COLS) {
      if (board[i][j] === player) {
        count++;
        if (count === 4) {
          return true;
        }
      } else {
        count = 0;
      }
    }
  }

  // check diagonal /
  count = 0;
  const offset2 = row + col;
  for (let i = 0; i < ROWS; i++) {
    const j = offset2 - i;
    if (j >= 0 && j < COLS) {
      if (board[i][j] === player) {
        count++;
        if (count === 4) {
          return true;
        }
      } else {
        count = 0;
      }
    }
  }

  return false;
}

function checkForDraw() {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (board[row][col] === 0) {
        return false;
      }
    }
  }
  return true;
}

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('A user disconnected');
    if (players[socket.id]) {
      const playerNumber = players[socket.id].number;
      delete players[socket.id];
      playerCount--;
      if (playerCount === 1) {
        const remainingPlayerId = Object.keys(players)[0];
        io.to(remainingPlayerId).emit('message', 'Waiting for an opponent...');
      }
      io.emit('message', `Player ${playerNumber} left the game.`);
    }
  });

  socket.on('join', () => {
    if (playerCount === 0) {
      players[socket.id] = { number: 1 };
      socket.emit('message', 'You are player 1. Waiting for an opponent...');
      playerCount++;
    } else if (playerCount === 1) {
      players[socket.id] = { number: 2 };
      socket.emit('message', 'You are player 2. Game on!');
      playerCount++;
      io.emit('start');
    } else {
      socket.emit('message', 'Game is full. Please try again later.');
    }
  });

  socket.on('drop', (col) => {
    const row = getLowestEmptyIndex(col);
    if (row !== -1) {
      board[row][col] = currentPlayer;
      io.emit('drop', { row, col, player: currentPlayer });
      if (checkForWin(row, col, currentPlayer)) {
        io.emit('win', currentPlayer);
        board = new Array(ROWS).fill().map(() => new Array(COLS).fill(0));
      } else if (checkForDraw()) {
        io.emit('draw');
        board = new Array(ROWS).fill().map(() => new Array(COLS).fill(0));
      } else {
        currentPlayer = currentPlayer === 1 ? 2 : 1;
      }
    }
  });
});

http.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

