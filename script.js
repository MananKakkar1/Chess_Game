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

const capturedBlackPiecesContainer = document.getElementById('captured-black');
const capturedWhitePiecesContainer = document.getElementById('captured-white');

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
    clearHighlights();
    if (selectedSquare) {
        const fromRow = parseInt(selectedSquare.dataset.row);
        const fromCol = parseInt(selectedSquare.dataset.col);
        const toRow = parseInt(square.dataset.row);
        const toCol = parseInt(square.dataset.col);

        const pieceClass = [...selectedSquare.classList].find(cls => cls.includes('-'));
        const targetPieceClass = [...square.classList].find(cls => cls.includes('-'));

        // console.log(`Moving ${pieceClass} from (${fromRow}, ${fromCol}) to (${toRow}, ${toCol})`);
        // console.log(`Target piece class: ${targetPieceClass}`);

        if (pieceColors[toRow][toCol] === pieceColors[fromRow][fromCol]) {
            selectedSquare.classList.remove('selected');
            selectedSquare = null;
            return;
        }
        // console.log("Checking move validity:", isValidMove(pieceClass, fromRow, fromCol, toRow, toCol, targetPieceClass));

        if (isValidMove(pieceClass, fromRow, fromCol, toRow, toCol, targetPieceClass)) {
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
    } else if ([...square.classList].some(cls => cls.includes('-'))) {
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);

        if (pieceColors[row][col] !== currentPlayer) {
            alert(`It's ${currentPlayer}'s turn!`);
            return;
        }

        selectedSquare = square;
        square.classList.add('selected');

        highlightValidMoves(row, col, [...square.classList].find(cls => cls.includes('-')));
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
            // console.log("Black pawn move check:", pieceColors[toRow][toCol]);
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
            if (!isPathBlocked(fromRow, fromCol, toRow, toCol)) {
                return (rowDiff === 0 || colDiff === 0); 
            }
            return false;
        case 'white-knight':
        case 'black-knight':
            return (Math.abs(rowDiff) === 2 && colDiff === 1) || (Math.abs(rowDiff) === 1 && colDiff === 2); 
        case 'white-bishop':
        case 'black-bishop':
            if (!isPathBlocked(fromRow, fromCol, toRow, toCol)) {
                return Math.abs(rowDiff) === colDiff;
            }
            return false;
        case 'white-queen':
        case 'black-queen':
            if (!isPathBlocked(fromRow, fromCol, toRow, toCol)) {
                return (Math.abs(rowDiff) === colDiff) || (rowDiff === 0 || colDiff === 0);
            }
            return false;
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

        const capturedPiece = document.createElement('div');
        capturedPiece.classList.add(targetPieceClass);
        
        if (pieceColors[toRow][toCol] === 'white') {
            // console.log("Captured piece color:", pieceColors[toRow][toCol]);
            capturedWhitePiecesContainer.appendChild(capturedPiece);
        } else {
            // console.log("Captured piece color2:", pieceColors[toRow][toCol]);
            capturedBlackPiecesContainer.appendChild(capturedPiece);
        }
    }

    // Move the piece to the target square
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

    capturedBlackPiecesContainer.innerHTML = '';
    capturedWhitePiecesContainer.innerHTML = '';

    updateTurnIndicator();
    generateChessboard();
}

function isKingInCheck(playerColor) { 
    let kingRow, kingCol;

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.querySelector(`.chessboard div[data-row="${row}"][data-col="${col}"]`);
            const piece = square ? [...square.classList].find(cls => cls.includes('-')) : null;
            if (
                (playerColor === 'white' && piece === 'white-king') ||
                (playerColor === 'black' && piece === 'black-king')
            ) {
                kingRow = row;
                kingCol = col;
                break;
            }
        }
    }

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.querySelector(`.chessboard div[data-row="${row}"][data-col="${col}"]`);
            const piece = square ? [...square.classList].find(cls => cls.includes('-')) : null;
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
                const square = document.querySelector(`.chessboard div[data-row="${row}"][data-col="${col}"]`);
                const targetPiece = square ? [...square.classList].find(cls => cls.includes('-')) : null;
                const targetColor = pieceColors[toRow][toCol];

                if (targetColor !== playerColor && isValidMove('white-king', kingRow, kingCol, toRow, toCol, targetPiece)) {
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
            const square = document.querySelector(`.chessboard div[data-row="${row}"][data-col="${col}"]`);
            const piece = square ? [...square.classList].find(cls => cls.includes('-')) : null;
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
    const fromSquare = document.querySelector(`.chessboard div[data-row="${fromRow}"][data-col="${fromCol}"]`);
    const toSquare = document.querySelector(`.chessboard div[data-row="${toRow}"][data-col="${toCol}"]`);

    const pieceClass = [...fromSquare.classList].find(cls => cls.includes('-'));
    const targetPieceClass = [...toSquare.classList].find(cls => cls.includes('-'));

    const originalPieceClass = targetPieceClass;
    const originalPieceColor = pieceColors[toRow][toCol];

    toSquare.classList.add(pieceClass);
    fromSquare.classList.remove(pieceClass);
    pieceColors[toRow][toCol] = pieceColors[fromRow][fromCol];
    pieceColors[fromRow][fromCol] = null;

    const kingInCheck = isKingInCheck(currentPlayer);

    fromSquare.classList.add(pieceClass);
    toSquare.classList.remove(pieceClass);
    if (originalPieceClass) {
        toSquare.classList.add(originalPieceClass);
    }
    pieceColors[fromRow][fromCol] = pieceColors[toRow][toCol];
    pieceColors[toRow][toCol] = originalPieceColor;
}

function getKing(color) {
    let kingRow, kingCol;
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.querySelector(`.chessboard div[data-row="${row}"][data-col="${col}"]`);
            const piece = square ? [...square.classList].find(cls => cls.includes('-')) : null;
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

function highlightValidMoves(fromRow, fromCol, pieceClass) {
    for (let toRow = 0; toRow < 8; toRow++) {
        for (let toCol = 0; toCol < 8; toCol++) {
            const targetSquare = document.querySelector(`.chessboard div[data-row="${toRow}"][data-col="${toCol}"]`);
            const targetPieceClass = targetSquare ? [...targetSquare.classList].find(cls => cls.includes('-')) : null;

            if (isValidMove(pieceClass, fromRow, fromCol, toRow, toCol, targetPieceClass)) {
                targetSquare.classList.add('valid-move');
            }
        }
    }
}

function clearHighlights() {
    const highlightedSquares = document.querySelectorAll('.valid-move');
    highlightedSquares.forEach(square => square.classList.remove('valid-move'));
}

generateChessboard();
document.querySelector('#reset-button').addEventListener('click', resetBoard);
