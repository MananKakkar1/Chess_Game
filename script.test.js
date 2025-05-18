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

// Set up the DOM before requiring script.js
document.body.innerHTML = '<div class="chessboard"></div><div id="reset-button"></div>';

// Now require script.js (after all mocks and DOM are set up)
const { isValidMove, isKingInCheck, isCheckmate, getAllValidMoves, movePiece } = require('./script');

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

// Test cases

// movePiece tests

// isValidMove tests

// isKingInCheck tests

// isCheckmate tests

// isPathBlocked tests

