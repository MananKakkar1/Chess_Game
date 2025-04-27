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
                const pieceClass = getPieceClass(piece);
                if (pieceClass) {
                    square.classList.add(pieceClass);
                }
            }

            square.addEventListener('click', () => handleSquareClick(square));
            chessboard.appendChild(square);
        }
    }
}

function getPieceClass(piece) {
    switch (piece) {
        case '♙': return 'white-pawn';
        case '♟': return 'black-pawn';
        case '♖': return 'white-rook';
        case '♜': return 'black-rook';
        case '♘': return 'white-knight';
        case '♞': return 'black-knight';
        case '♗': return 'white-bishop';
        case '♝': return 'black-bishop';
        case '♕': return 'white-queen';
        case '♛': return 'black-queen';
        case '♔': return 'white-king';
        case '♚': return 'black-king';
        default: return null;
    }
}

function handleSquareClick(square) {
    if (selectedSquare) {
        const fromRow = parseInt(selectedSquare.dataset.row);
        const fromCol = parseInt(selectedSquare.dataset.col);
        const toRow = parseInt(square.dataset.row);
        const toCol = parseInt(square.dataset.col);

        const pieceClass = [...selectedSquare.classList].find(cls => cls.includes('-'));
        const targetPieceClass = [...square.classList].find(cls => cls.includes('-'));

        console.log(`Moving ${pieceClass} from (${fromRow}, ${fromCol}) to (${toRow}, ${toCol})`);
        console.log(`Target piece class: ${targetPieceClass}`);

        if (pieceColors[toRow][toCol] === pieceColors[fromRow][fromCol]) {
            selectedSquare.classList.remove('selected');
            selectedSquare = null;
            return;
        }
        console.log("Checking move validity:", isValidMove(pieceClass, fromRow, fromCol, toRow, toCol, targetPieceClass));

        if (isValidMove(pieceClass, fromRow, fromCol, toRow, toCol, targetPieceClass)) {
            movePiece(selectedSquare, square, fromRow, fromCol, toRow, toCol);
            currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
            updateTurnIndicator();
        }

        selectedSquare.classList.remove('selected');
        selectedSquare = null;
    } else if ([...square.classList].some(cls => cls.includes('-'))) {
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

function isValidMove(pieceClass, fromRow, fromCol, toRow, toCol, targetPieceClass) {
    const rowDiff = toRow - fromRow;
    const colDiff = Math.abs(toCol - fromCol);
    switch (pieceClass) {
        case 'white-pawn':
            if (fromRow === 6 && rowDiff === -2 && colDiff === 0 && !boardState[toRow][toCol] && !boardState[toRow + 1][toCol]) {
                return true; 
            }
            if (rowDiff === -1 && colDiff === 0 && !boardState[toRow][toCol]) {
                return true; 
            }
            if (rowDiff === -1 && colDiff === 1 && targetPieceClass && pieceColors[toRow][toCol] === 'black') {
                return true;
            }
            return false;
        case 'black-pawn':
            console.log("Black pawn move check:", pieceColors[toRow][toCol]);
            if (fromRow === 1 && rowDiff === 2 && colDiff === 0 && !boardState[toRow][toCol] && !boardState[toRow - 1][toCol]) {
                return true; 
            }
            if (rowDiff === 1 && colDiff === 0 && !boardState[toRow][toCol]) {
                return true; 
            }
            if (rowDiff === 1 && colDiff === 1 && targetPieceClass && pieceColors[toRow][toCol] === 'white') {
                return true;
            }
            return false;
        case 'white-rook':
        case 'black-rook':
            return (rowDiff === 0 || colDiff === 0); 
        case 'white-knight':
        case 'black-knight':
            return (Math.abs(rowDiff) === 2 && colDiff === 1) || (Math.abs(rowDiff) === 1 && colDiff === 2); 
        case 'white-bishop':
        case 'black-bishop':
            return Math.abs(rowDiff) === colDiff; 
        case 'white-queen':
        case 'black-queen':
            return (Math.abs(rowDiff) === colDiff) || (rowDiff === 0 || colDiff === 0); 
        case 'white-king':
        case 'black-king':
            return Math.abs(rowDiff) <= 1 && colDiff <= 1; 
        default:
            return false;
    }
}

function movePiece(fromSquare, toSquare, fromRow, fromCol, toRow, toCol) {
    const pieceClass = [...fromSquare.classList].find(cls => cls.includes('-'));
    const targetPieceClass = [...toSquare.classList].find(cls => cls.includes('-'));

    boardState[toRow][toCol] = boardState[fromRow][fromCol];
    boardState[fromRow][fromCol] = null;

    pieceColors[toRow][toCol] = pieceColors[fromRow][fromCol];
    pieceColors[fromRow][fromCol] = null;

    if (targetPieceClass) {
        toSquare.classList.remove(targetPieceClass);
    }

    toSquare.classList.add(pieceClass);
    fromSquare.classList.remove(pieceClass);
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