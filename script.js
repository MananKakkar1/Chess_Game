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

function botMove() {
    console.log("Bot's turn to move!");
    const difficulty = document.getElementById('bot-difficulty').value;
    if (difficulty === 'easy') {
        makeRandomMove();
    } else if (difficulty === 'medium') {
        makeGreedyMove();
    } else if (difficulty === 'hard') {
        makeMinimaxMove();
    }
}

function makeRandomMove() {
    let validMoves;
    // Check if the king is in check and fetch appropriate moves
    if (isKingInCheck('black')) {
        validMoves = getAllCheckValidMoves('black');
    } else {
        validMoves = getAllValidMoves('black');
    }
    console.log(validMoves.length); // Log the number of valid moves

    if (validMoves.length > 0) {
        let move = undefined;
        while (move === undefined) {
            move = validMoves[Math.floor(Math.random() * validMoves.length)];
        }
        console.log(`Bot move: ${move.fromRow}, ${move.fromCol} to ${move.toRow}, ${move.toCol}, ${move}`);
        if (move && move.fromRow !== undefined && move.fromCol !== undefined && move.toRow !== undefined && move.toCol !== undefined) {
            console.log("Executing Move:", move);
            executeMove(move);
        } else {
            console.error("Invalid Move Object:", move);
        }
        currentPlayer = 'white'; // Switch back to the player
        updateTurnIndicator();
    } else {
        console.log("No valid moves for the bot. Stalemate or skip turn.");
    }
}

function makeGreedyMove() {}
function makeMinimaxMove() {}

function getAllValidMoves(playerColor) {
    const moves = [];
    let kingInCheck;
    for (let fromRow = 0; fromRow < 8; fromRow++) {
        for (let fromCol = 0; fromCol < 8; fromCol++) {
            const square = document.querySelector(`.chessboard div[data-row="${fromRow}"][data-col="${fromCol}"]`);
            const piece = square ? [...square.classList].find(cls => cls.includes('-')) : null;
            const pieceColor = piece && piece.startsWith('white') ? 'white' : (piece && piece.startsWith('black') ? 'black' : null);

            if (piece && pieceColor === playerColor) {
                for (let toRow = 0; toRow < 8; toRow++) {
                    for (let toCol = 0; toCol < 8; toCol++) {
                        const targetSquare = document.querySelector(`.chessboard div[data-row="${toRow}"][data-col="${toCol}"]`);
                        const targetPieceClass = targetSquare ? [...targetSquare.classList].find(cls => cls.includes('-')) : null;

                        if (isValidMove(piece, fromRow, fromCol, toRow, toCol, targetPieceClass) && !isPathBlocked(fromRow, fromCol, toRow, toCol) && !isKingInCheck('black') && (fromRow !== toRow || fromCol !== toCol)) {
                            console.log(`Valid move for ${piece} from (${fromRow}, ${fromCol}) to (${toRow}, ${toCol})`);
                            kingInCheck = simulateMove(fromRow, fromCol, toRow, toCol);
                            if (!kingInCheck) {
                                moves.push({ fromRow, fromCol, toRow, toCol });
                            }
                        }
                    }
                }
            }
        }
    }
    return moves;
}

function getAllCheckValidMoves(playerColor) {
    const moves = [];
    if (isKingInCheck('black')) {
        let fromRow, fromCol;
        let kingClass;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.querySelector(`.chessboard div[data-row="${row}"][data-col="${col}"]`);
                const piece = square ? [...square.classList].find(cls => cls.includes('-')) : null;
                if (piece === `${playerColor}-king`) {
                    fromRow = row;
                    fromCol = col;
                    kingClass = piece;
                    break;
                }
            }
        }
        let kingInCheck;
        //Check if the king can move to a safe square
        for (let toRow = fromRow - 1; toRow <= fromRow + 1; toRow++) {
            for (let toCol = fromCol - 1; toCol <= fromCol + 1; toCol++) {
                if (toRow >= 0 && toRow < 8 && toCol >= 0 && toCol < 8 && (toRow !== fromRow || toCol !== fromCol)) {
                    console.log(`Checking move to (${toRow}, ${toCol})`);
                    const square = document.querySelector(`.chessboard div[data-row="${toRow}"][data-col="${toCol}"]`);
                    const targetPieceClass = square ? [...square.classList].find(cls => cls.includes('-')) : null;
                    const targetColor = targetPieceClass && targetPieceClass.startsWith('white') ? 'white' : 'black';
                    if ((targetColor !== playerColor || targetPieceClass === undefined) && isValidMove(kingClass, fromRow, fromCol, toRow, toCol, targetPieceClass)) {
                        kingInCheck = simulateMove(fromRow, fromCol, toRow, toCol);
                        // console.log(`King ${kingInCheck} in simulation by ${targetPieceClass} at (${toRow}, ${toCol})`);
                        if (!kingInCheck) {
                            console.log(`Valid move for ${kingClass} from (${fromRow}, ${fromCol}) to (${toRow}, ${toCol})`);
                            moves.push({ fromRow, fromCol, toRow, toCol });
                        }
                    }
                }
            }
        }
        //Check if any other pieces can move to block the check
        for (let fromRow = 0; fromRow < 8; fromRow++) {
            for (let fromCol = 0; fromCol < 8; fromCol++) {
                const square = document.querySelector(`.chessboard div[data-row="${fromRow}"][data-col="${fromCol}"]`);
                const piece = square ? [...square.classList].find(cls => cls.includes('-')) : null;
                const pieceColor = pieceColors[fromRow][fromCol];
                if (piece && pieceColor !== playerColor) {
                    for (let toRow = 0; toRow < 8; toRow++) {
                        for (let toCol = 0; toCol < 8; toCol++) {
                            const targetPieceClass = [...square.classList].find(cls => cls.includes('-'));
                            const targetColor = targetPieceClass && targetPieceClass.startsWith('white') ? 'white' : 'black';
                            if (targetColor === playerColor && isValidMove(piece, fromRow, fromCol, toRow, toCol, targetPieceClass)) {
                                kingInCheck = simulateMove(fromRow, fromCol, toRow, toCol);
                                if (!kingInCheck) {
                                    // console.log(`${piece} can move from (${fromRow}, ${fromCol}) to (${toRow}, ${toCol}) without putting the ${playerColor} king in check`);
                                    console.log(`Valid move for ${piece} from (${fromRow}, ${fromCol}) to (${toRow}, ${toCol})`);
                                    moves.push({ fromRow, fromCol, toRow, toCol });
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return moves;
}

function executeMove(move) {
    const fromSquare = document.querySelector(`.chessboard div[data-row="${move.fromRow}"][data-col="${move.fromCol}"]`);
    const toSquare = document.querySelector(`.chessboard div[data-row="${move.toRow}"][data-col="${move.toCol}"]`);
    if (!fromSquare || !toSquare) {
        console.error('Invalid squares for move:', { fromSquare, toSquare });
        return;
    }
    movePiece(fromSquare, toSquare, move.fromRow, move.fromCol, move.toRow, move.toCol);
}

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
        let targetColor = targetPieceClass && targetPieceClass.startsWith('white') ? 'white' : 'black';
        let pieceColor = pieceClass && pieceClass.startsWith('white') ? 'white' : 'black';

        if (targetColor === pieceColor) {
            selectedSquare.classList.remove('selected');
            selectedSquare = null;
            // alert("You cannot capture your own piece!");
            return;
        }
        // console.log(`Moving ${pieceClass} from (${fromRow}, ${fromCol}) to (${toRow}, ${toCol})`);
        // console.log(`Target piece: ${targetPieceClass}, Target color: ${targetColor}`);
        // console.log(`Current player: ${currentPlayer}`);
        // console.log(`Piece color: ${pieceColors[fromRow][fromCol]}`);
        // console.log(`Is Piece able to move? ` + isValidMove(pieceClass, fromRow, fromCol, toRow, toCol, targetPieceClass));
        // console.log(`Is Path blocked? ` + isPathBlocked(fromRow, fromCol, toRow, toCol));
        // console.log(`Is King in check? ` + isKingInCheck(currentPlayer));
        // console.log(`Is Checkmate? ` + isCheckmate(currentPlayer));
        if (isValidMove(pieceClass, fromRow, fromCol, toRow, toCol, targetPieceClass)) {
            movePiece(selectedSquare, square, fromRow, fromCol, toRow, toCol);
            if (isKingInCheck(currentPlayer)) {
                movePiece(square, selectedSquare, toRow, toCol, fromRow, fromCol);
                square.classList.add(targetPieceClass);
                alert("Invalid move: Your king is in check!");
                selectedSquare.classList.remove('selected');
                selectedSquare = null;
                capturedWhitePiecesContainer.remove(targetPieceClass)
                return;
            }
            currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
            updateTurnIndicator();
            if (isKingInCheck(currentPlayer)) {
                if (isCheckmate(currentPlayer)) {
                    alert(`${currentPlayer === 'white' ? 'Black' : 'White'} wins! Checkmate!`);
                    showGameOverOverlay(currentPlayer === 'white' ? 'Black' : 'White');
                    return;
                } else {
                    alert(`${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)} King is in check!`);
                }
            }
        }

        selectedSquare.classList.remove('selected');
        selectedSquare = null;
        return;
    } else if ([...square.classList].some(cls => cls.includes('-'))) {
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);

        if (pieceColors[row][col] !== currentPlayer) {
            alert(`It's ${currentPlayer}'s turn!`);
            return;
        }

        selectedSquare = square;
        square.classList.add('selected');
        return;
    }
    // console.log('Something went wrong!');
}

function showGameOverOverlay(winner) {
    const overlay = document.getElementById('game-over-overlay');
    const winnerLabel = document.getElementById('winner-label');
    winnerLabel.textContent = `${winner} wins!`;
    overlay.classList.remove('hidden');
}

function isValidMove(pieceClass, fromRow, fromCol, toRow, toCol, targetPieceClass) {
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);

    // Prevent moving to a spot occupied by a like-colored piece
    if (targetPieceClass && pieceClass.startsWith('white') && targetPieceClass.startsWith('white')) {
        return false;
    }
    if (targetPieceClass && pieceClass.startsWith('black') && targetPieceClass.startsWith('black')) {
        return false;
    }

    switch (pieceClass) {
        case 'white-pawn':
            if (toRow >= fromRow) return false; // White pawns can only move up
            if (fromRow === 6 && rowDiff === 2 && colDiff === 0 && !targetPieceClass) {
                return true;
            }
            if (rowDiff === 1 && colDiff === 0 && !targetPieceClass) {
                return true;
            }
            if (rowDiff === 1 && colDiff === 1 && targetPieceClass && targetPieceClass.startsWith('black')) {
                return true;
            }
            return false;

        case 'black-pawn':
            if (toRow <= fromRow) return false; // Black pawns can only move down
            if (fromRow === 1 && rowDiff === 2 && colDiff === 0 && !targetPieceClass) {
                return true;
            }
            if (rowDiff === 1 && colDiff === 0 && !targetPieceClass) {
                return true;
            }
            if (rowDiff === 1 && colDiff === 1 && targetPieceClass && targetPieceClass.startsWith('white')) {
                return true;
            }
            return false;

        case 'white-rook':
        case 'black-rook':
            if (!isPathBlocked(fromRow, fromCol, toRow, toCol)) {
                return rowDiff === 0 || colDiff === 0;
            }
            return false;

        case 'white-knight':
        case 'black-knight':
            return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);

        case 'white-bishop':
        case 'black-bishop':
            if (!isPathBlocked(fromRow, fromCol, toRow, toCol)) {
                return rowDiff === colDiff;
            }
            return false;

        case 'white-queen':
        case 'black-queen':
            if (!isPathBlocked(fromRow, fromCol, toRow, toCol)) {
                return rowDiff === colDiff || rowDiff === 0 || colDiff === 0;
            }
            return false;

        case 'white-king':
        case 'black-king':
            if (!isPathBlocked(fromRow, fromCol, toRow, toCol)) {
                return rowDiff <= 1 && colDiff <= 1;
            }
            return false;

        default:
            return false;
    }
}

function movePiece(fromSquare, toSquare, fromRow, fromCol, toRow, toCol) {
    const pieceClass = [...fromSquare.classList].find(cls => cls.includes('-'));
    const targetPieceClass = [...toSquare.classList].find(cls => cls.includes('-'));
    let playerColor = targetPieceClass && targetPieceClass.startsWith('white') ? 'white' : 'black';
    if (targetPieceClass && !isKingInCheck(playerColor)) {
        toSquare.classList.remove(targetPieceClass);
        const capturedPiece = document.createElement('div');
        capturedPiece.classList.add(targetPieceClass);
        if (playerColor === 'white') {
            capturedWhitePiecesContainer.appendChild(capturedPiece);
        } else {
            capturedBlackPiecesContainer.appendChild(capturedPiece);
        }
    }

    toSquare.classList.add(pieceClass);
    fromSquare.classList.remove(pieceClass);
    fromSquare.classList.remove('selected');
    pieceColors[toRow][toCol] = pieceColors[fromRow][fromCol];
    pieceColors[fromRow][fromCol] = null;
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

    const urlParams = new URLSearchParams(window.location.search);
    console.log(urlParams.get('mode'));
    if (urlParams.get('mode') === 'bot') {
        console.log('Bot mode enabled');
        generateBotChessboard();
    } else {
        generateChessboard();
    }

    const overlay = document.getElementById('game-over-overlay');
    overlay.classList.add('hidden');
    const winnerLabel = document.getElementById('winner-label');
    winnerLabel.textContent = '';
}

function isKingInCheck(playerColor) { 
    let fromRow, fromCol;
    let kingClass;
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.querySelector(`.chessboard div[data-row="${row}"][data-col="${col}"]`);
            const piece = square ? [...square.classList].find(cls => cls.includes('-')) : null;
            if (piece === `${playerColor}-king`) {
                fromRow = row;
                fromCol = col;
                kingClass = piece;
                break;
            }
        }
    }

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.querySelector(`.chessboard div[data-row="${row}"][data-col="${col}"]`);
            const piece = square ? [...square.classList].find(cls => cls.includes('-')) : null;
            const pieceColor = piece && piece.startsWith('white') ? 'white' : (piece && piece.startsWith('black') ? 'black' : null);
            // console.log(`Checking piece: ${piece} at (${row}, ${col}) with color ${pieceColor}`);
            if (pieceColor !== playerColor && pieceColor !== null) {
                if (fromRow === undefined || fromCol === undefined) {
                    return false;
                } 
                if (isValidMove(piece, row, col, fromRow, fromCol, kingClass) && !isPathBlocked(row, col, fromRow, fromCol)) {
                    const targetPieceClass = [...square.classList].find(cls => cls.includes('-'));
                    const targetColor = targetPieceClass && targetPieceClass.startsWith('white') ? 'white' : 'black';
                    // console.log(`King is in check by ${piece} at (${row}, ${col})`);
                    return true;
                }
            }
        }
    }

    return false; 
}

function isCheckmate(playerColor) {
    let fromRow, fromCol;
    let kingClass;
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.querySelector(`.chessboard div[data-row="${row}"][data-col="${col}"]`);
            const piece = square ? [...square.classList].find(cls => cls.includes('-')) : null;
            if (piece === `${playerColor}-king`) {
                fromRow = row;
                fromCol = col;
                kingClass = piece;
                break;
            }
        }
    }
    let kingInCheck;
    console.log(`King position: (${fromRow}, ${fromCol})`);
    for (let toRow = fromRow - 1; toRow <= fromRow + 1; toRow++) {
        for (let toCol = fromCol - 1; toCol <= fromCol + 1; toCol++) {
            if (toRow >= 0 && toRow < 8 && toCol >= 0 && toCol < 8 && (toRow !== fromRow || toCol !== fromCol)) {
                console.log(`Checking move to (${toRow}, ${toCol})`);
                const square = document.querySelector(`.chessboard div[data-row="${toRow}"][data-col="${toCol}"]`);
                const targetPieceClass = square ? [...square.classList].find(cls => cls.includes('-')) : null;
                const targetColor = targetPieceClass && targetPieceClass.startsWith('white') ? 'white' : 'black';
                // console.log(isValidMove(kingClass, fromRow, fromCol, toRow, toCol, targetPieceClass));
                // console.log(isValidMove(targetPieceClass, fromRow, fromCol, toRow, toCol, kingClass));
                // console.log(`Is valid move: ${isValidMove(kingClass, fromRow, fromCol, toRow, toCol, targetPieceClass)}`);
                // console.log(`Color Check: ${targetColor !== playerColor}`);
                // console.log(`Target Piece Class: ${targetPieceClass}`);
                // console.log(`Target Color: ${targetColor}`);
                // console.log(`Player Color: ${playerColor}`);
                if ((targetColor !== playerColor || targetPieceClass === undefined) && isValidMove(kingClass, fromRow, fromCol, toRow, toCol, targetPieceClass)) {
                    kingInCheck = simulateMove(fromRow, fromCol, toRow, toCol);
                    // console.log(`King ${kingInCheck} in simulation by ${targetPieceClass} at (${toRow}, ${toCol})`);
                    if (!kingInCheck) {
                        return false; 
                    }
                }
            }
        }
    }

    for (let fromRow = 0; fromRow < 8; fromRow++) {
        for (let fromCol = 0; fromCol < 8; fromCol++) {
            const square = document.querySelector(`.chessboard div[data-row="${fromRow}"][data-col="${fromCol}"]`);
            const piece = square ? [...square.classList].find(cls => cls.includes('-')) : null;
            const pieceColor = pieceColors[fromRow][fromCol];
            if (piece && pieceColor !== playerColor) {
                for (let toRow = 0; toRow < 8; toRow++) {
                    for (let toCol = 0; toCol < 8; toCol++) {
                        const targetPieceClass = [...square.classList].find(cls => cls.includes('-'));
                        const targetColor = targetPieceClass && targetPieceClass.startsWith('white') ? 'white' : 'black';
                        if (targetColor === playerColor && isValidMove(piece, fromRow, fromCol, toRow, toCol, targetPieceClass)) {
                            kingInCheck = simulateMove(fromRow, fromCol, toRow, toCol);
                            if (!kingInCheck) {
                                // console.log(`${piece} can move from (${fromRow}, ${fromCol}) to (${toRow}, ${toCol}) without putting the ${playerColor} king in check`);
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
    if (
        fromRow === undefined || fromCol === undefined || toRow === undefined || toCol === undefined ||
        isNaN(fromRow) || isNaN(fromCol) || isNaN(toRow) || isNaN(toCol) ||
        fromRow < 0 || fromRow >= 8 || fromCol < 0 || fromCol >= 8 ||
        toRow < 0 || toRow >= 8 || toCol < 0 || toCol >= 8
    ) {
        console.error('Invalid coordinates passed to isPathBlocked:', { fromRow, fromCol, toRow, toCol });
        return false;
    }
    const rowStep = Math.sign(toRow - fromRow);
    const colStep = Math.sign(toCol - fromCol);
    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;
    while (currentRow !== toRow || currentCol !== toCol) {
        // Failsafe: if the current square is out of bounds, break the loop
        if (currentRow < 0 || currentRow >= 8 || currentCol < 0 || currentCol >= 8) {
            break;
        }
        // Extract the current square
        const square = document.querySelector(`.chessboard div[data-row="${currentRow}"][data-col="${currentCol}"]`);
        const piece = square ? [...square.classList].find(cls => cls.includes('-')) : null;
        // console.log(currentCol, currentRow, piece);
        // Check if the square is occupied
        if (piece) {
            // console.log('Path is blocked at', currentRow, currentCol, 'by', square.classList[1]);
            // console.log('path is blocked by', square.classList[1]);
            return true; 
        }
        currentRow += rowStep;
        currentCol += colStep;
    }
    // console.log('Path is clear from', fromRow, fromCol, 'to', toRow, toCol);
    return false; 
}

function simulateMove(fromRow, fromCol, toRow, toCol) {
    if (
        fromRow === undefined || fromCol === undefined || toRow === undefined || toCol === undefined ||
        isNaN(fromRow) || isNaN(fromCol) || isNaN(toRow) || isNaN(toCol) ||
        fromRow < 0 || fromRow >= 8 || fromCol < 0 || fromCol >= 8 ||
        toRow < 0 || toRow >= 8 || toCol < 0 || toCol >= 8
    ) {
        console.error('Invalid coordinates passed to simulateMove:', { fromRow, fromCol, toRow, toCol });
        return true; 
    }

    const fromSquare = document.querySelector(`.chessboard div[data-row="${fromRow}"][data-col="${fromCol}"]`);
    const toSquare = document.querySelector(`.chessboard div[data-row="${toRow}"][data-col="${toCol}"]`);

    const pieceClass = [...fromSquare.classList].find(cls => cls.includes('-'));
    const targetPieceClass = [...toSquare.classList].find(cls => cls.includes('-'));

    movePiece(fromSquare, toSquare, fromRow, fromCol, toRow, toCol);    

    const kingInCheck = isKingInCheck(currentPlayer);

    movePiece(toSquare, fromSquare, toRow, toCol, fromRow, fromCol); 
    toSquare.classList.add(targetPieceClass);

    return kingInCheck;
}

function getKing(playerColor) {
    let fromRow, fromCol;
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.querySelector(`.chessboard div[data-row="${row}"][data-col="${col}"]`);
            const piece = square ? [...square.classList].find(cls => cls.includes('-')) : null;
            if (
                (playerColor === 'white' && piece === 'white-king') ||
                (playerColor === 'black' && piece === 'black-king')
            ) {
                fromRow = row;
                fromCol = col;
                break;
            }
        }
    }
    return { row: fromRow, col: fromCol };
}

function handleBotSquareClick(square) {
    if (selectedSquare) {
        const fromRow = parseInt(selectedSquare.dataset.row);
        const fromCol = parseInt(selectedSquare.dataset.col);
        const toRow = parseInt(square.dataset.row);
        const toCol = parseInt(square.dataset.col);

        const pieceClass = [...selectedSquare.classList].find(cls => cls.includes('-'));
        const targetPieceClass = [...square.classList].find(cls => cls.includes('-'));
        const pieceColor = pieceClass && pieceClass.startsWith('white') ? 'white' : 'black';

        // Prevent moving pieces that do not belong to the current player
        if (pieceColor !== currentPlayer) {
            alert(`It's ${currentPlayer}'s turn! You cannot move ${pieceColor} pieces.`);
            selectedSquare.classList.remove('selected');
            selectedSquare = null;
            return;
        }

        if (isValidMove(pieceClass, fromRow, fromCol, toRow, toCol, targetPieceClass) && currentPlayer === 'white') {
            movePiece(selectedSquare, square, fromRow, fromCol, toRow, toCol);

            if (isKingInCheck(currentPlayer)) {
                movePiece(square, selectedSquare, toRow, toCol, fromRow, fromCol);
                square.classList.add(targetPieceClass);
                alert("Invalid move: Your king is in check!");
                selectedSquare.classList.remove('selected');
                selectedSquare = null;
                return;
            }

            currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
            updateTurnIndicator();

            selectedSquare = null; // Reset selectedSquare after a valid move

            if (currentPlayer === 'black') {
                setTimeout(botMove, 500); // Bot moves after a short delay
            }

            if (isKingInCheck(currentPlayer)) {
                if (isCheckmate(currentPlayer)) {
                    alert(`${currentPlayer === 'white' ? 'Black' : 'White'} wins! Checkmate!`);
                    showGameOverOverlay(currentPlayer === 'white' ? 'Black' : 'White');
                    return;
                } else {
                    alert(`${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)} King is in check!`);
                }
            }
        }
        if (selectedSquare !== null) {
            selectedSquare.classList.remove('selected');
            selectedSquare = null; // Reset selectedSquare if the move is invalid
        }
        return;
    } else if ([...square.classList].some(cls => cls.includes('-'))) {
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);

        const pieceClass = [...square.classList].find(cls => cls.includes('-'));
        const pieceColor = pieceClass && pieceClass.startsWith('white') ? 'white' : 'black';

        if (pieceColor !== currentPlayer) {
            alert(`It's ${currentPlayer}'s turn!`);
            return;
        }

        selectedSquare = square; // Update selectedSquare when a new square is clicked
        square.classList.add('selected');
        return;
    }
}

function enableBotMode() {
    const squares = document.querySelectorAll('.chessboard div');
    squares.forEach(square => {
        square.removeEventListener('click', handleSquareClick);
        square.addEventListener('click', () => handleBotSquareClick(square));
    });
}

function initializeGame() {
    const urlParams = new URLSearchParams(window.location.search);
    console.log(urlParams.get('mode'));
    if (urlParams.get('mode') === 'bot') {
        console.log('Bot mode enabled');
        generateBotChessboard();
    } else {
        generateChessboard();
    }
}

function generateBotChessboard() {
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

            square.addEventListener('click', () => handleBotSquareClick(square));
            chessboard.appendChild(square);
        }
    }
}

initializeGame();
document.querySelector('#reset-button').addEventListener('click', resetBoard);
