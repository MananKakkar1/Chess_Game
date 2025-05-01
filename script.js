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
            const originalPiece = boardState[toRow][toCol];
            const originalColor = pieceColors[toRow][toCol];

            movePiece(selectedSquare, square, fromRow, fromCol, toRow, toCol);

            if (isKingInCheck(currentPlayer)) {
                movePiece(square, selectedSquare, toRow, toCol, fromRow, fromCol);
                boardState[toRow][toCol] = originalPiece;
                pieceColors[toRow][toCol] = originalColor;

                alert("Invalid move: Your king is in check!");
                selectedSquare.classList.remove('selected');
                selectedSquare = null;
                return;
            }
            currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
            updateTurnIndicator();

            if (isKingInCheck(currentPlayer)) {
                if (isCheckmate(currentPlayer)) {
                    alert(`${currentPlayer === 'white' ? 'Black' : 'White'} wins! Checkmate!`);
                    return;
                } else {
                    alert(`${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)} King is in check!`);
                }
            }
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
            if (!isPathBlocked(fromRow, fromCol, toRow, toCol)) {
                return Math.abs(rowDiff) === colDiff;
            }
        case '♕': 
        case '♛': 
            if (!isPathBlocked(fromRow, fromCol, toRow, toCol)) {
                return (Math.abs(rowDiff) === colDiff) || (rowDiff === 0 || colDiff === 0);
            }
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

function isKingInCheck(playerColor) { 
    let kingRow, kingCol;

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = boardState[row][col];
            if (
                (playerColor === 'white' && piece === '♔') ||
                (playerColor === 'black' && piece === '♚')
            ) {
                kingRow = row;
                kingCol = col;
                break;
            }
        }
    }

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = boardState[row][col];
            const pieceColor = pieceColors[row][col];

            if (piece && pieceColor !== playerColor && pieceColor !== null) {
                if (isValidMove(piece, row, col, kingRow, kingCol, '♔' || '♚') && !isPathBlocked(row, col, kingRow, kingCol)) {
                    return true; 
                }
            }
        }
    }

    return false; 
}

function isCheckmate(playerColor) {
    let kingRow, kingCol = getKing(playerColor);
    for (let toRow = kingRow - 1; toRow <= kingRow + 1; toRow++) {
        for (let toCol = kingCol - 1; toCol <= kingCol + 1; toCol++) {
            if (toRow >= 0 && toRow < 8 && toCol >= 0 && toCol < 8 && (toRow !== kingRow || toCol !== kingCol)) {
                const targetPiece = boardState[toRow][toCol];
                const targetColor = pieceColors[toRow][toCol];

                if (targetColor !== playerColor && isValidMove('♔', kingRow, kingCol, toRow, toCol, targetPiece)) {
                    simulateMove(kingRow, kingCol, toRow, toCol);
                    if (!kingInCheck) {
                        return false; 
                    }
                }
            }
        }
    }

    for (let fromRow = 0; fromRow < 8; fromRow++) {
        for (let fromCol = 0; fromCol < 8; fromCol++) {
            const piece = boardState[fromRow][fromCol];
            const pieceColor = pieceColors[fromRow][fromCol];

            if (piece && pieceColor === playerColor) {
                for (let toRow = 0; toRow < 8; toRow++) {
                    for (let toCol = 0; toCol < 8; toCol++) {
                        const targetPiece = boardState[toRow][toCol];
                        const targetColor = pieceColors[toRow][toCol];

                        if (targetColor !== playerColor && isValidMove(piece, fromRow, fromCol, toRow, toCol, targetPiece)) {
                            simulateMove(fromRow, fromCol, toRow, toCol);
                            if (!kingInCheck) {
                                return false; 
                            }
                        }
                    }
                }
            }
        }
    }

    return true; 
}

function isPathBlocked(fromRow, fromCol, toRow, toCol) {
    const rowStep = Math.sign(toRow - fromRow);
    const colStep = Math.sign(toCol - fromCol);

    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;

    while (currentRow !== toRow || currentCol !== toCol) {
        if (boardState[currentRow][currentCol] !== null) {
            return true; 
        }
        currentRow += rowStep;
        currentCol += colStep;
    }

    return false; 
}

function simulateMove(fromRow, fromCol, toRow, toCol) {
    const originalPiece = boardState[toRow][toCol];
    const originalColor = pieceColors[toRow][toCol];

    boardState[toRow][toCol] = piece;
    boardState[fromRow][fromCol] = null;
    pieceColors[toRow][toCol] = pieceColor;
    pieceColors[fromRow][fromCol] = null;

    const kingInCheck = isKingInCheck(playerColor);

    boardState[fromRow][fromCol] = piece;
    boardState[toRow][toCol] = originalPiece;
    pieceColors[fromRow][fromCol] = pieceColor;
    pieceColors[toRow][toCol] = originalColor;
}

function getKing(color) {
    let kingRow, kingCol;
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = boardState[row][col];
            if (
                (playerColor === 'white' && piece === '♔') ||
                (playerColor === 'black' && piece === '♚')
            ) {
                kingRow = row;
                kingCol = col;
                break;
            }
        }
    }
    return { row: kingRow, col: kingCol };
}
generateChessboard();
document.querySelector('#reset-button').addEventListener('click', resetBoard);