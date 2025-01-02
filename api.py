from flask import Flask, request, jsonify
from flask_cors import CORS
from cbs import cbs
from grid import create_grid
from a_star import a_star
from dijkstra import dijkstra  # Import Dijkstra implementation
from weighted_a_star import weighted_a_star  # Import Weighted A* implementation
from greedy_best_first import greedy_best_first  # Import Greedy Best-First Search implementation

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
        algorithm = data.get("algorithm", "A*")  # Default to A* if no algorithm is provided
        weight = data.get("weight", 1.0)  # Default weight for Weighted A*

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

        # Create grid
        grid = create_grid(rows, cols, obstacles)

        # Run the selected algorithm
        paths = []
        algo_details = ""

        if algorithm == "Dijkstra":
            algo_details = "Dijkstra's Algorithm"
            paths = [
                dijkstra(grid, agent["start"], agent["goal"])
                for agent in agents
            ]
        elif algorithm == "A*":
            algo_details = "A* Algorithm"
            paths = [
                a_star(grid, agent["start"], agent["goal"])
                for agent in agents
            ]
        elif algorithm == "Weighted A*":
            algo_details = f"Weighted A* (Weight={weight})"
            paths = [
                weighted_a_star(grid, agent["start"], agent["goal"], weight)
                for agent in agents
            ]
        elif algorithm == "Greedy Best-First Search":
            algo_details = "Greedy Best-First Search"
            paths = [
                greedy_best_first(grid, agent["start"], agent["goal"])
                for agent in agents
            ]
        elif algorithm == "CBS":
            algo_details = "Conflict-Based Search (CBS)"
            paths = cbs(grid, agents)
        else:
            return jsonify({"error": "Unsupported algorithm."}), 400

        # Analyze failure cases
        if not paths or any(len(path) == 0 for path in paths):
            blocked_agents = [
                f"Agent {agent['id']} is blocked." for i, agent in enumerate(agents) if not paths or len(paths[i]) == 0
            ]

            conflict_message = " ".join(blocked_agents) if blocked_agents else "Unable to calculate paths."
            return jsonify({
                "paths": [],
                "conflict": True,
                "algoDetails": algo_details,
                "conflictMessage": conflict_message,
            })

        # Successful response
        return jsonify({
            "paths": paths,
            "conflict": False,
            "algoDetails": algo_details,
            "conflictMessage": "Paths calculated successfully!",
        })

    except Exception as e:
        # Catch unexpected errors
        print(f"Error: {e}")
        return jsonify({"error": "An unexpected error occurred.", "details": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
