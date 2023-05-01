const socket = io();

const gameBoard = document.getElementById('game-board');
const resetBtn = document.getElementById('reset-btn');
const message = document.getElementById('message');

let myTurn = false;

gameBoard.addEventListener('click', (event) => {
  if (!myTurn) return;
  const row = event.target.dataset.row;
  const col = event.target.dataset.col;
  if (row && col) {
    socket.emit('drop', { row: parseInt(row), col: parseInt(col) });
  }
});

resetBtn.addEventListener('click', () => {
  socket.emit('new-game');
});

socket.on('connect', () => {
  console.log('Connected to server:', socket.id);
});

socket.on('drop', ({ row, col, player }) => {
  const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  square.classList.add(`player-${player}`);
  myTurn = player !== 1;
});

socket.on('game-over', ({ winner }) => {
  message.textContent = `Player ${winner} wins!`;
  myTurn = false;
});

socket.on('game-reset', () => {
  message.textContent = '';
  myTurn = false;
  const squares = document.querySelectorAll('.square');
  squares.forEach((square) => {
    square.classList.remove('player-1', 'player-2');
  });
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
