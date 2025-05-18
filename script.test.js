/**
 * Make sure you have set "testEnvironment": "jsdom" in your jest config or package.json.
 * Also, ensure that script.js does not run DOM/Worker code at the top level (wrap in checks or functions).
 */

global.Worker = class {
    constructor() {}
    postMessage() {}
    terminate() {}
    addEventListener() {}
    removeEventListener() {}
};

// Mock any global variables/functions used at the top level in script.js
global.boardState = Array.from({ length: 8 }, () => Array(8).fill(null));
global.getPieceClass = (piece) => piece ? piece : null;
global.handleSquareClick = () => {};

document.body.innerHTML = '<div class="chessboard"></div><div id="reset-button"></div>';

// Now require script.js (after all mocks and DOM are set up)
const { isValidMove, isKingInCheck, isCheckmate, getAllValidMoves, movePiece, isPathBlocked } = require('./script');

beforeEach(() => {
    document.body.innerHTML = '<div class="chessboard"></div>';
    const chessboard = document.querySelector('.chessboard');
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
});

/*
Run test cases using 'npm test' in the terminal.
*/

// Add Test Cases Below

/*
movePiece test cases:
test('movePiece moves a piece from (r, c) to (r, c)', () => {
    // Description: Should move the specified piece class from the source square to the destination square.
    const fromSq = document.querySelector('[data-row="FROM_ROW"][data-col="FROM_COL"]');
    const toSq = document.querySelector('[data-row="TO_ROW"][data-col="TO_COL"]');
    fromSq.classList.add('pieceClass');
    movePiece(fromSq, toSq, FROM_ROW, FROM_COL, TO_ROW, TO_COL);
    expect([...toSq.classList]).toContain('pieceClass');
    expect([...fromSq.classList]).not.toContain('pieceClass');
});
*/

test('movePiece moves a white-pawn from (6, 4) to (5, 4)', () => {
    const fromSq = document.querySelector('[data-row="6"][data-col="4"]');
    const toSq = document.querySelector('[data-row="5"][data-col="4"]');
    fromSq.classList.add('white-pawn');
    movePiece(fromSq, toSq, 6, 4, 5, 4);
    expect([...toSq.classList]).toContain('white-pawn');
    expect([...fromSq.classList]).not.toContain('white-pawn');
});

test('movePiece moves a black-pawn from (1, 4) to (2, 4)', () => {
    const fromSq = document.querySelector('[data-row="1"][data-col="4"]');
    const toSq = document.querySelector('[data-row="2"][data-col="4"]');
    fromSq.classList.add('black-pawn');
    movePiece(fromSq, toSq, 1, 4, 2, 4);
    expect([...toSq.classList]).toContain('black-pawn');
    expect([...fromSq.classList]).not.toContain('black-pawn');
});

/*
isValidMove test cases:
test('isValidMove returns true for piece moving forward', () => {
    // Description: Should return true if the specified piece can legally move from the source to the destination square.
    const fromSq = document.querySelector('[data-row="FROM_ROW"][data-col="FROM_COL"]');
    fromSq.classList.add('pieceClass');
    const result = isValidMove('pieceClass', FROM_ROW, FROM_COL, TO_ROW, TO_COL, null);
    expect(result).toBe(true);
});
*/

test('isValidMove returns true for white-pawn moving forward 1 space', () => {
    const fromSq = document.querySelector('[data-row="6"][data-col="4"]');
    fromSq.classList.add('white-pawn');
    const result = isValidMove('white-pawn', 6, 4, 5, 4, null);
    expect(result).toBe(true);
});

test('isValidMove returns true for black-pawn moving forward 1 space', () => {
    const fromSq = document.querySelector('[data-row="1"][data-col="4"]');
    fromSq.classList.add('black-pawn');
    const result = isValidMove('black-pawn', 1, 4, 2, 4, null);
    expect(result).toBe(true);
});

/*
isKingInCheck test cases:
test('isKingInCheck returns true when king is in check by a piece', () => {
    // Description: Should return true if the specified king is under attack by an opposing piece.
    const kingSq = document.querySelector('[data-row="KING_ROW"][data-col="KING_COL"]');
    kingSq.classList.add('kingClass');
    const attackerSq = document.querySelector('[data-row="ATTACKER_ROW"][data-col="ATTACKER_COL"]');
    attackerSq.classList.add('pieceClass');
    const result = isKingInCheck('kingColor');
    expect(result).toBe(true);
});
*/

test('isKingInCheck returns true when black-king is attacked by a white-knight', () => {
    const kingSq = document.querySelector('[data-row="4"][data-col="4"]');
    kingSq.classList.add('black-king');
    const attackerSq = document.querySelector('[data-row="6"][data-col="5"]');
    attackerSq.classList.add('white-knight');
    const result = isKingInCheck('black');
    expect(result).toBe(true);
});

test('isKingInCheck returns false when king is not attacked', () => {
    const kingSq = document.querySelector('[data-row="4"][data-col="4"]');
    kingSq.classList.add('black-king');
    const attackerSq = document.querySelector('[data-row="6"][data-col="5"]');
    attackerSq.classList.add('white-knight');
    attackerSq.classList.remove('white-knight');
    const farSq = document.querySelector('[data-row="7"][data-col="7"]');
    farSq.classList.add('white-knight');
    const result = isKingInCheck('black');
    expect(result).toBe(false);
});

/*
isCheckmate test cases:
test('isCheckmate returns true when king is checkmated', () => {
    // Description: Should return true if the specified king is in checkmate and has no legal moves to escape.
    const kingSq = document.querySelector('[data-row="KING_ROW"][data-col="KING_COL"]');
    kingSq.classList.add('kingClass');
    const attacker1 = document.querySelector('[data-row="ATTACKER1_ROW"][data-col="ATTACKER1_COL"]');
    attacker1.classList.add('pieceClass');
    const attacker2 = document.querySelector('[data-row="ATTACKER2_ROW"][data-col="ATTACKER2_COL"]');
    attacker2.classList.add('pieceClass');
    const result = isCheckmate('kingColor');
    expect(result).toBe(true);
});
*/

test('isCheckmate returns false when black-king is just checked, not checkmated', () => {
    const kingSq = document.querySelector('[data-row="4"][data-col="4"]');
    kingSq.classList.add('black-king');
    const attacker1 = document.querySelector('[data-row="6"][data-col="5"]');
    attacker1.classList.add('white-knight');
    const result = isCheckmate('black');
    expect(result).toBe(false);
});

test('isCheckmate returns true when black-king is checkmated by the 4-move checkmate', () => {
    placePieces(layout); // Place pieces on the board to setup the game normally. Then simulate the 4-move checkmate.
    movePiece(document.querySelector('[data-row="1"][data-col="4"]'), document.querySelector('[data-row="2"][data-col="4"]'), 1, 4, 2, 4);
    movePiece(document.querySelector('[data-row="0"][data-col="3"]'), document.querySelector('[data-row="4"][data-col="7"]'), 0, 3, 4, 7);
    movePiece(document.querySelector('[data-row="0"][data-col="5"]'), document.querySelector('[data-row="3"][data-col="2"]'), 0, 5, 3, 2);
    movePiece(document.querySelector('[data-row="4"][data-col="7"]'), document.querySelector('[data-row="6"][data-col="5"]'), 4, 7, 6, 5);
    const result = isCheckmate('black');
    expect(result).toBe(true);
});

/*
isPathBlocked test cases:
test('isPathBlocked returns true when a piece blocks the path', () => {
    // Description: Should return true if there is any piece blocking the path between the source and destination squares.
    const blocker = document.querySelector('[data-row="BLOCKER_ROW"][data-col="BLOCKER_COL"]');
    blocker.classList.add('pieceClass');
    const result = isPathBlocked(FROM_ROW, FROM_COL, TO_ROW, TO_COL);
    expect(result).toBe(true);
});
*/

test('isPathBlocked returns true when a piece blocks the path', () => {
    const piece = document.querySelector('[data-row="6"][data-col="4"]');
    piece.classList.add('white-queen');
    const blocker = document.querySelector('[data-row="4"][data-col="4"]');
    blocker.classList.add('white-pawn');
    const result = isPathBlocked(6, 4, 2, 4);
    expect(result).toBe(true);
});

test('isPathBlocked returns false when no piece blocks the path', () => {
    const piece = document.querySelector('[data-row="6"][data-col="4"]');
    piece.classList.add('white-queen');
    const result = isPathBlocked(6, 4, 2, 4);
    expect(result).toBe(false);
});

/**
 * Places pieces on the chessboard according to a 2D array.
 * @param {string[][]} layout - 8x8 array where each cell is a piece class or null.
 */
function placePieces(layout) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const pieceClass = layout[row][col];
            if (pieceClass) {
                const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                if (square) square.classList.add(pieceClass);
            }
        }
    }
}

const layout = [
    ['black-rook', 'black-knight', 'black-bishop', 'black-queen', 'black-king', 'black-bishop', 'black-knight', 'black-rook'],
    ['black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn'],
    ['white-rook', 'white-knight', 'white-bishop', 'white-queen', 'white-king', 'white-bishop', 'white-knight', 'white-rook'],
];
