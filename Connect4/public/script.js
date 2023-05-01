const ROWS = 6;
const COLS = 7;
const RED = 1;
const YELLOW = 2;

const gameBoard = document.getElementById('game-board');
const messageBox = document.getElementById('message-box');
const resetButton = document.getElementById('reset-button');

let currentPlayer = 1;
let board = new Array(ROWS).fill().map(() => new Array(COLS).fill(0));

const socket = io();

socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

socket.on('drop', (data) => {
  const { row, col, player } = data;
  const cell = gameBoard.rows[row].cells[col];
  cell.classList.add(player === RED ? 'red' : 'yellow');
});

socket.on('turn', (playerNumber) => {
  currentPlayer = playerNumber;
  messageBox.innerHTML = `Player ${currentPlayer}'s turn`;
});

socket.on('win', (playerNumber) => {
  messageBox.innerHTML = `Player ${playerNumber} wins!`;
});

socket.on('draw', () => {
  messageBox.innerHTML = `Draw!`;
});

socket.on('reset', () => {
  resetBoard();
  messageBox.innerHTML = 'New game';
});

gameBoard.addEventListener('click', (event) => {
  const column = event.target.cellIndex;
  if (column !== undefined && column >= 0) {
    socket.emit('drop', column);
  }
});

resetButton.addEventListener('click', () => {
  socket.emit('reset');
});

function resetBoard() {
  board = new Array(ROWS).fill().map(() => new Array(COLS).fill(0));
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      gameBoard.rows[row].cells[col].classList.remove('red', 'yellow');
    }
  }
}

messageBox.innerHTML = `Player ${currentPlayer}'s turn`;
