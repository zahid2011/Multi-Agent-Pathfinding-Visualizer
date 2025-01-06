import React, { useState, useEffect } from "react";
import axios from "axios";
import Grid from "./Grid";
import "./App.css";

function App() {
  const [rows] = useState(10);
  const [cols] = useState(10);
  const [gridSize, setGridSize] = useState({ rows: 10, cols: 10 });
  const [isGridSizeLocked, setIsGridSizeLocked] = useState(false); 

  const handleGridSizeChange = (e) => {
    const { name, value } = e.target;
    setGridSize({
      ...gridSize,
      [name]: value === "" ? "" : Number(value),
    });
  };

  const applyGridSizeChange = () => {
    if (!isAnimating) {
      setPaths([]);
      setAnimationPaths([]);
      setAnimationIndex(0);
      setAgents([
        {
          id: 1,
          start: [0, 0],
          goal: [gridSize.rows - 1, gridSize.cols - 1],
          color: "#007bff",
        },
      ]);
      setSelectedAgent(1);
  
      // Resetting the grid data
      setGridData(
        Array(gridSize.rows)
          .fill(null)
          .map(() => Array(gridSize.cols).fill(0))
      );

      setConflictMessage("");
      setStatus("No simulation run yet");
      setAlgoInfo("No simulation run yet");
    }
  };
  
  const [gridData, setGridData] = useState(
    Array(rows)
      .fill(null)
      .map(() => Array(cols).fill(0))
  );

  const [agents, setAgents] = useState([
    { id: 1, start: [0, 0], goal: [9, 9], color: "#007bff" },
  ]);
  const [selectedAgent, setSelectedAgent] = useState(1);
  const [paths, setPaths] = useState([]);
  const [animationPaths, setAnimationPaths] = useState([]);
  const [conflictMessage, setConflictMessage] = useState("");
  const [mode, setMode] = useState("obstacle");
  const [animationIndex, setAnimationIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [algoInfo, setAlgoInfo] = useState("No simulation run yet");
  const [status, setStatus] = useState("No simulation run yet");
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("A*");
  const [weight, setWeight] = useState(1.0);

  // Automatically update the algorithm based on the number of agents
  useEffect(() => {
    if (agents.length === 1) {
      setSelectedAlgorithm("A*");
    } else {
      setSelectedAlgorithm("CBS");
    }
  }, [agents]);

  const addAgent = () => {
    const newAgentId = agents.length + 1;
    setAgents([
      ...agents,
      {
        id: newAgentId,
        start: [0, 0],
        goal: [rows - 1, cols - 1],
        color: getRandomColor(),
      },
    ]);
    setSelectedAgent(newAgentId);
  };

  const removeAgent = () => {
    if (agents.length <= 1) {
      setConflictMessage("At least one agent must be present.");
      return;
    }
    const updatedAgents = agents.filter((agent) => agent.id !== selectedAgent);
    setAgents(updatedAgents);
    setSelectedAgent(updatedAgents[0]?.id || 1);
  };

  const getRandomColor = () => {
    const colors = ["#007bff", "#28a745", "#ffc107", "#ff6347", "#6c757d"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleCellClick = (row, col) => {
    const newGrid = gridData.map((rowArray) => [...rowArray]);

    if (mode === "obstacle") {
      if (
        agents.some(
          (agent) =>
            (row === agent.start[0] && col === agent.start[1]) ||
            (row === agent.goal[0] && col === agent.goal[1])
        )
      ) {
        setConflictMessage("Cannot place an obstacle on a start or goal cell.");
        return;
      }
      newGrid[row][col] = newGrid[row][col] === 1 ? 0 : 1;
    } else {
      const updatedAgents = agents.map((agent) =>
        agent.id === selectedAgent
          ? {
              ...agent,
              [mode]: [row, col],
            }
          : agent
      );
      setAgents(updatedAgents);
    }

    setGridData(newGrid);
    setConflictMessage("");
  };

  const handleRunSimulation = async () => {
    try {
      setConflictMessage("");
      setStatus("Running simulation...");
      setPaths([]);
      setAnimationPaths([]);
      setAnimationIndex(0);
      setIsAnimating(false);
      setAlgoInfo("Running simulation...");
      const obstacles = gridData.reduce((acc, row, rowIndex) => {
        return acc.concat(
          row
            .map((cell, colIndex) =>
              cell === 1 ? [rowIndex, colIndex] : null
            )
            .filter(Boolean)
        );
      }, []);

      // Calling the backend
      const response = await axios.post("http://127.0.0.1:5000/solve", {
        rows,
        cols,
        obstacles,
        agents,
        algorithm: selectedAlgorithm,
        weight: selectedAlgorithm === "Weighted A*" ? weight : undefined, 
      });

      // Extract response details
      const { paths, conflict, algoDetails, conflictMessage } = response.data;

      setPaths(paths || []);
      setAlgoInfo(algoDetails || "Unknown Algorithm");

      if (conflict) {
        setConflictMessage(
          conflictMessage || "Conflict detected: Unable to calculate paths."
        );
        setStatus(
          conflictMessage || "Conflict detected: Unable to calculate paths."
        );
      } else {
        setConflictMessage("");
        setStatus("Paths calculated successfully!");
        animatePaths(paths); // Starting animation
      }
    } catch (error) {
      console.error("Error running simulation:", error);
      setConflictMessage("An error occurred during simulation.");
      setStatus("Error occurred during simulation.");
      setAlgoInfo("Error");
    }
  };

  const animatePaths = (paths) => {
    setAnimationPaths(paths);
    setIsAnimating(true);
    let step = 0;
  
    const maxSteps = Math.max(...paths.map((path) => path.length));
    let animationInterval = setInterval(() => {
      if (step >= maxSteps) {
        clearInterval(animationInterval);
        setIsAnimating(false);
        return;
      }
      setAnimationIndex(step);
      step += 1;
    }, 500);
  
    
    window.currentAnimationInterval = animationInterval;
  };

  const clearPaths = () => {
    if (isAnimating) {
      clearInterval(window.currentAnimationInterval); 
      setIsAnimating(false);
    }
    setPaths([]);
    setAnimationPaths([]);
    setAnimationIndex(0);
    setConflictMessage("");
    setStatus("No simulation run yet");
    setAlgoInfo("No simulation run yet");
  };
  const getModeMessage = () => {
    switch (mode) {
      case "obstacle":
        return "Click on the grid to place or remove obstacles.";
      case "start":
        return "Click on a cell to set the starting position for the selected agent.";
      case "goal":
        return "Click on a cell to set the goal position for the selected agent.";
      default:
        return "";
    }
  };

  return (
    <div className="container">
      <div className="left-sidebar">
        <h2>Agent Controls</h2>
        <label htmlFor="agentSelect">Select Agent:</label>
        <select
          id="agentSelect"
          onChange={(e) => setSelectedAgent(Number(e.target.value))}
          value={selectedAgent}
        >
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              Agent {agent.id}
            </option>
          ))}
        </select>
        <button className="add-agent-btn" onClick={addAgent}>
          Add Agent
        </button>
        <button
          className="remove-agent-btn"
          onClick={removeAgent}
          disabled={agents.length <= 1}
        >
          Remove Agent
        </button>
             
        <div className="grid-size-box">
          <h3>Change Grid Size</h3>
          <label>
            Rows:
            <input
              type="number"
              name="rows"
              min="2"
              max="20"
              value={gridSize.rows}
              onChange={handleGridSizeChange}
              disabled={isAnimating}
            />
          </label>
          <label>
            Columns:
            <input
              type="number"
              name="cols"
              min="2"
              max="20"
              value={gridSize.cols}
              onChange={handleGridSizeChange}
              disabled={isAnimating}
            />
          </label>
          <button
            onClick={applyGridSizeChange}
            disabled={isAnimating || gridSize.rows < 2 || gridSize.cols < 2}
          >
            Change Grid Size
          </button>
        </div>
      </div>

      <div className="App">
        <h1>Multi-Agent Pathfinding Visualizer</h1>
        <div className="algorithm-select">
          <label htmlFor="algorithm">Select Algorithm:</label>
          <select
            id="algorithm"
            value={selectedAlgorithm}
            onChange={(e) => setSelectedAlgorithm(e.target.value)}
          >
            <option value="CBS">Conflict-Based Search (CBS)</option>
            <option value="A*">A* Algorithm</option>
            <option value="Dijkstra">Dijkstra</option>
            <option value="Weighted A*">Weighted A*</option>
            <option value="Greedy Best-First Search">Greedy Best-First</option>
          </select>
        </div>
        {selectedAlgorithm === "Weighted A*" && (
          <div className="weight-input">
            <label htmlFor="weight">Enter Weight:</label>
            <input
              id="weight"
              type="number"
              step="0.1"
              min="0"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
            />
          </div>
        )}

        <div className="controls">
          <button
            className={mode === "obstacle" ? "active" : ""}
            onClick={() => setMode("obstacle")}
          >
            Place Obstacles
          </button>
          <button
            className={mode === "start" ? "active" : ""}
            onClick={() => setMode("start")}
          >
            Set Start
          </button>
          <button
            className={mode === "goal" ? "active" : ""}
            onClick={() => setMode("goal")}
          >
            Set Goal
          </button>
        </div>
        <p className="mode-message">{getModeMessage()}</p>
        <Grid
          rows={rows}
          cols={cols}
          onCellClick={handleCellClick}
          gridData={gridData}
          paths={animationPaths.map((path) =>
            path.slice(0, animationIndex + 1)
          )}
          agents={agents}
        />
        <button onClick={handleRunSimulation} disabled={isAnimating}>
          Run Simulation
        </button>
        <button onClick={clearPaths}>Clear Paths</button>
      </div>

      <div className="sidebar">
        <h2>Simulation Details</h2>
        <p>
          <strong>Algorithm Used:</strong> {algoInfo}
        </p>
        {status && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px",
              backgroundColor: status.includes("Conflict")
                ? "#fce8e6"
                : status.includes("successfully")
                ? "#e6f4ea"
                : "#f0f0f0",
              border: status.includes("Conflict")
                ? "1px solid #d93025"
                : status.includes("successfully")
                ? "1px solid #34a853"
                : "1px solid #ccc",
              borderRadius: "8px",
              color: status.includes("Conflict")
                ? "#d93025"
                : status.includes("successfully")
                ? "#34a853"
                : "#333",
              
            }}
          >
            <strong>Status:</strong>
            <span>{status}</span>
            <span
              style={{
                fontSize: "1.5em",
                color: status.includes("Conflict")
                  ? "#d93025"
                  : status.includes("successfully")
                  ? "#34a853"
                  : "#ccc",
                  
              }}
            >
              {status.includes("Conflict") ? "❌" : status.includes("successfully") ? "✔️" : ""}
            </span>
          </div>
        )}
        <h3>Paths</h3>
        {paths.length > 0 ? (
          <div style={{ maxHeight: "200px", overflowY: "auto", padding: "10px", border: "1px solid #ccc", borderRadius: "8px" }}>
            {paths.map((path, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: "#f9f9f9",
                  margin: "5px 0",
                  padding: "10px",
                  borderRadius: "8px",
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                }}
              >
                <strong>Agent {index + 1}:</strong>
                <ul style={{ margin: 0, paddingLeft: "20px" }}>
                  {path.map((step, stepIndex) => (
                    <li key={stepIndex} style={{ fontSize: "0.9em" }}>
                      {`[${step[0]}, ${step[1]}]`}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p>No paths calculated yet.</p>
        )}
        <h3>Conflict Resolution</h3>
        {conflictMessage ? (
          <p style={{ color: "#d93025" }}>{conflictMessage}</p>
        ) : (
          <p>No conflicts detected.</p>
        )}

        <div className="about-me">
            <h3>About Me</h3>
            <p>
              Hi, I'm a developer passionate about multi-agent systems and pathfinding. Check out my work on GitHub
            </p>
            <a
              href="https://github.com/zahid2011"
              target="_blank"
              rel="noopener noreferrer"
              className="github-link"
            >
              <img
                src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                alt="GitHub Logo"
              />
              <span>GitHub</span>
            </a>
          </div>
      </div>
    </div>
  );
}

export default App;
