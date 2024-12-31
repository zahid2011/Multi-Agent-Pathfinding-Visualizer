from flask import Flask, request, jsonify
from flask_cors import CORS
from cbs import cbs
from grid import create_grid

app = Flask(__name__)
CORS(app)

@app.route("/solve", methods=["POST"])
def solve_mapf():
    try:
        # Parse request data
        data = request.json

        if not data or "rows" not in data or "cols" not in data:
            return jsonify({"error": "Missing grid dimensions."}), 400

        rows, cols = data["rows"], data["cols"]
        obstacles = data.get("obstacles", [])
        agents = data.get("agents", [])

        # Validate input data
        if not isinstance(rows, int) or not isinstance(cols, int):
            return jsonify({"error": "Rows and columns must be integers."}), 400

        if not isinstance(obstacles, list) or not all(isinstance(o, list) and len(o) == 2 for o in obstacles):
            return jsonify({"error": "Obstacles must be a list of [x, y] coordinates."}), 400

        if not isinstance(agents, list) or not all("start" in a and "goal" in a for a in agents):
            return jsonify({"error": "Agents must have 'start' and 'goal' defined."}), 400

        # Assign IDs to agents if missing
        for index, agent in enumerate(agents):
            if "id" not in agent:
                agent["id"] = index

        # Log input data
        print(f"Grid Dimensions: {rows}x{cols}")
        print(f"Obstacles: {obstacles}")
        print(f"Agents: {agents}")

        # Create grid
        grid = create_grid(rows, cols, obstacles)
        print("Generated Grid:", grid)

        # Calculate paths
        paths = cbs(grid, agents)
        if not paths or any(len(path) == 0 for path in paths):
            return jsonify({"paths": [], "conflict": True})

        # Return successful response
        return jsonify({"paths": paths, "conflict": False})
    
    except Exception as e:
        # Catch unexpected errors
        print(f"Error: {e}")
        return jsonify({"error": "An unexpected error occurred."}), 500

if __name__ == "__main__":
    app.run(debug=True)
