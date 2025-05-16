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
    player = data['player']

    # Convert board to a string for the prompt
    board_string = '\n'.join([','.join([cell if cell else 'empty' for cell in row]) for row in board])

    prompt = f"""
You are a chess engine. Given the following board state (8x8, top row is row 0, left column is col 0), and it's {player}'s turn, return the best legal move as JSON in the format:
{{"fromRow": int, "fromCol": int, "toRow": int, "toCol": int}}
Only return the JSON object, nothing else.

Board:
{board_string}
"""

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=100,
            temperature=0.2
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