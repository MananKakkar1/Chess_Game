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

const { isValidMove, generateChessboard, isKingInCheck, isCheckmate, getAllValidMoves, movePiece } = require('./script');

beforeEach(() => {
    // Reset the DOM and generate a fresh chessboard before each test
    document.body.innerHTML = '<div class="chessboard"></div>';
    generateChessboard();
});

test('pawn moves forward', () => {
    expect(isValidMove('white-pawn', 6, 4, 5, 4, null)).toBe(true);
});

test('pawn cannot move sideways', () => {
    expect(isValidMove('white-pawn', 6, 4, 6, 5, null)).toBe(false);
});

test('rook moves vertically', () => {
    // Place a rook at (7,0)
    const rookSquare = document.querySelector('[data-row="7"][data-col="0"]');
    rookSquare.classList.add('white-rook');
    expect(isValidMove('white-rook', 7, 0, 5, 0, null)).toBe(true);
});

test('rook cannot jump over pieces', () => {
    // Place a rook at (7,0) and a pawn at (6,0)
    const rookSquare = document.querySelector('[data-row="7"][data-col="0"]');
    rookSquare.classList.add('white-rook');
    const pawnSquare = document.querySelector('[data-row="6"][data-col="0"]');
    pawnSquare.classList.add('white-pawn');
    expect(isValidMove('white-rook', 7, 0, 5, 0, null)).toBe(false);
});

test('king is not in check at start', () => {
    expect(isKingInCheck('white')).toBe(false);
    expect(isKingInCheck('black')).toBe(false);
});

test('getAllValidMoves returns only legal moves', () => {
    const moves = getAllValidMoves('white');
    moves.forEach(move => {
        const fromSq = document.querySelector(`.chessboard div[data-row="${move.fromRow}"][data-col="${move.fromCol}"]`);
        const piece = fromSq ? [...fromSq.classList].find(cls => cls.includes('-')) : null;
        const toSq = document.querySelector(`.chessboard div[data-row="${move.toRow}"][data-col="${move.toCol}"]`);
        const target = toSq ? [...toSq.classList].find(cls => cls.includes('-')) : null;
        expect(isValidMove(piece, move.fromRow, move.fromCol, move.toRow, move.toCol, target)).toBe(true);
    });
});

test('movePiece moves a piece correctly', () => {
    const fromSq = document.querySelector('[data-row="6"][data-col="4"]');
    const toSq = document.querySelector('[data-row="4"][data-col="4"]');
    movePiece(fromSq, toSq, 6, 4, 4, 4);
    expect([...toSq.classList]).toContain('white-pawn');
    expect([...fromSq.classList]).not.toContain('white-pawn');
});

// Add more tests for isCheckmate, bishop/knight/queen moves, etc., as needed.
