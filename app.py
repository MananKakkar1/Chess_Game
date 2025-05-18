import os
from flask import Flask, request, jsonify
import openai
from flask_cors import CORS
from dotenv import load_dotenv
# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS if your frontend runs on a different port
openai.api_key = os.getenv("OPENAI_API_KEY")

@app.route('/api/llm-chess-move', methods=['POST'])
def llm_chess_move():
    data = request.get_json()
    board = data['board']
    print(f"Received board: {board}")
    player = data['player']
    lastMove = data['lastMove']
    pastMoves = data['pastMoves']
    validMoves = data['validMoves']
    # Convert board to a string for the prompt
    board_string = '\n'.join([','.join([cell if cell else 'empty' for cell in row]) for row in board])
    print(f"Board string: {board_string}")
    prompt = f"""You are a chess engine. The board is an 8x8, 0-indexed matrix (row 0 is top, col 0 is left). Each cell contains a piece (e.g., "white-queen") or None.
    Board:
    {board_string}
    Chess rules:
    NOTE ANY PIECE CANNOT OVERLAP WITH ANOTHER LIKE-COLORED PIECE AND A PIECE CANNOT BE MOVED TO A CELL IF THERE IS ANOTHER PIECE BLOCKING ITS PATH.
    A piece has its path blocked if there is a piece between the origin and destination cell. This applies to all pieces except the knight.
    If you a king is in check, you must make a move to get out of check. This can include capturing the piece that is putting you in check or moving the king to a safe square. You cannot make a move that puts your king in check.
    A piece can be captured if it is an opponent's piece and is in the path of a piece that can capture it. The following are the rules for each piece:
    - King: moves 1 square any direction.
    - Queen: any number of squares, any direction if its path is NOT blocked by ANY PIECE.
    - Rook: any number of squares, horizontal/vertical if its path is NOT blocked by ANY PIECE.
    - Bishop: any number of squares, diagonal if its path is NOT blocked by ANY PIECE.
    - Knight: "L" shape (2+1).
    - Pawn: forward 1, captures diagonally, first move can go 2. Promote on last rank.
    - Make sure to check for any blockages on the path for any piece. If a like colored piece is in the way, the move is illegal. Also, if a opposite colored piece is in the way, it is a valid capture unless it breaks the rule of movement of the piece.
    It's {player}'s turn. Reply ONLY with the best legal move as JSON: {{"fromRow": int, "fromCol": int, "toRow": int, "toCol": int}}. 
    Never make the same move twice. Make sure the move differs from any move in {pastMoves}. In the board, None represents an empty cell. Never make a move from an empty cell or a cell with None in the board. 
    The current possible moves are: {validMoves}.
    """.strip()

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo", #change to gpt-4o for better results, 3.5-turbo is ALOT cheaper
            messages=[{"role": "user", "content": prompt}],
            max_tokens=100,
            temperature=0.8
        )
        content = response.choices[0].message.content
        import re, json
        match = re.search(r"\{[\s\S]*\}", content)
        move = json.loads(match.group(0)) if match else None
        return jsonify({'move': move})
    except Exception as e:
        print(e)
        return jsonify({'error': 'Failed to get move from OpenAI'}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)