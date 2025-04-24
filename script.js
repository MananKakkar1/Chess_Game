const chessboard = document.querySelector('.chessboard');
const turnIndicator = document.querySelector('#turn-indicator');

const initialBoard = [
    ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
    ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
    ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
];

const initialColors = [
    ['black', 'black', 'black', 'black', 'black', 'black', 'black', 'black'],
    ['black', 'black', 'black', 'black', 'black', 'black', 'black', 'black'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white'],
    ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white']
];

let boardState = initialBoard.map(row => row.slice());
let pieceColors = initialColors.map(row => row.slice());
let selectedSquare = null;
let currentPlayer = 'white';

function generateChessboard() {
    chessboard.innerHTML = ''; 
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.dataset.row = row;
            square.dataset.col = col;

            if ((row + col) % 2 === 0) {
                square.classList.add('white');
            } else {
                square.classList.add('black');
            }

            const piece = boardState[row][col];
            if (piece) {
                square.textContent = piece;
            }

            square.addEventListener('click', () => handleSquareClick(square));
            chessboard.appendChild(square);
        }
    }
}

function handleSquareClick(square) {
    if (selectedSquare) {
        const fromRow = parseInt(selectedSquare.dataset.row);
        const fromCol = parseInt(selectedSquare.dataset.col);
        const toRow = parseInt(square.dataset.row);
        const toCol = parseInt(square.dataset.col);

        const piece = selectedSquare.textContent;
        const targetPiece = square.textContent;

        if (pieceColors[toRow][toCol] === pieceColors[fromRow][fromCol]) {
            selectedSquare.classList.remove('selected');
            selectedSquare = null;
            return;
        }

        if (isValidMove(piece, fromRow, fromCol, toRow, toCol, targetPiece)) {
            movePiece(selectedSquare, square, fromRow, fromCol, toRow, toCol);
            currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
            updateTurnIndicator();
        }

        selectedSquare.classList.remove('selected');
        selectedSquare = null;
    } else if (square.textContent) {
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);

        if (pieceColors[row][col] !== currentPlayer) {
            alert(`It's ${currentPlayer}'s turn!`);
            return;
        }

        selectedSquare = square;
        square.classList.add('selected');
    }
}

function isValidMove(piece, fromRow, fromCol, toRow, toCol, targetPiece) {
    const rowDiff = toRow - fromRow;
    const colDiff = Math.abs(toCol - fromCol);

    switch (piece) {
        case '♙':
            if (fromRow === 6 && rowDiff === -2 && colDiff === 0 && !boardState[toRow][toCol] && !boardState[toRow + 1][toCol]) {
                return true; 
            }
            if (rowDiff === -1 && colDiff === 0 && !boardState[toRow][toCol]) {
                return true; 
            }
            if (rowDiff === -1 && colDiff === 1 && targetPiece && pieceColors[toRow][toCol] === 'black') {
                return true;
            }
            return false;
        case '♟':
            if (fromRow === 1 && rowDiff === 2 && colDiff === 0 && !boardState[toRow][toCol] && !boardState[toRow - 1][toCol]) {
                return true; 
            }
            if (rowDiff === 1 && colDiff === 0 && !boardState[toRow][toCol]) {
                return true; 
            }
            if (rowDiff === 1 && colDiff === 1 && targetPiece && pieceColors[toRow][toCol] === 'white') {
                return true;
            }
            return false;
        case '♜':
            return (rowDiff === 0 || colDiff === 0); 
        case '♘':
        case '♞':
            return (Math.abs(rowDiff) === 2 && colDiff === 1) || (Math.abs(rowDiff) === 1 && colDiff === 2); 
        case '♗':
        case '♝':
            return Math.abs(rowDiff) === colDiff; 
        case '♕':
        case '♛':
            return (Math.abs(rowDiff) === colDiff) || (rowDiff === 0 || colDiff === 0); 
        case '♔':
        case '♚':
            return Math.abs(rowDiff) <= 1 && colDiff <= 1; 
        default:
            return false;
    }
}

function movePiece(fromSquare, toSquare, fromRow, fromCol, toRow, toCol) {
    const piece = fromSquare.textContent;
    boardState[toRow][toCol] = piece;
    boardState[fromRow][fromCol] = null;

    pieceColors[toRow][toCol] = pieceColors[fromRow][fromCol];
    pieceColors[fromRow][fromCol] = null;

    toSquare.textContent = piece;
    fromSquare.textContent = '';
    fromSquare.classList.remove('selected');
}

function updateTurnIndicator() {
    turnIndicator.textContent = `Current Turn: ${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}`;
}

function resetBoard() {
    boardState = initialBoard.map(row => row.slice());
    pieceColors = initialColors.map(row => row.slice());
    selectedSquare = null;
    currentPlayer = 'white';
    updateTurnIndicator();
    generateChessboard();
}

generateChessboard();
document.querySelector('#reset-button').addEventListener('click', resetBoard);