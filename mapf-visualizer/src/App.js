import React, { useState, useEffect } from "react";
import axios from "axios";
import Grid from "./Grid";
import "./App.css";

function App() {
  const [rows] = useState(10);
  const [cols] = useState(10);
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
  const [algoInfo, setAlgoInfo] = useState("No simulation run yet"); // Updated initial state
  const [status, setStatus] = useState("No simulation run yet"); // Added status state
  const [conflictDetails, setConflictDetails] = useState([]); // Conflict resolution steps
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("A*"); // Default to A*

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
      setConflictDetails([]);
  
      // Prepare obstacle data for backend
      const obstacles = gridData.reduce((acc, row, rowIndex) => {
        return acc.concat(
          row.map((cell, colIndex) => (cell === 1 ? [rowIndex, colIndex] : null)).filter(Boolean)
        );
      }, []);
  
      // Call backend
      const response = await axios.post("http://127.0.0.1:5000/solve", {
        rows,
        cols,
        obstacles,
        agents,
        algorithm: selectedAlgorithm,
      });
  
      // Extract response details
      const { paths, conflict, algoDetails, conflictMessage } = response.data;
  
      setPaths(paths || []);
      setAlgoInfo(algoDetails || "Unknown Algorithm");
  
      if (conflict) {
        // Display the specific conflict message from the backend
        setConflictMessage(conflictMessage || "Conflict detected: Unable to calculate paths.");
        setStatus(conflictMessage || "Conflict detected: Unable to calculate paths.");
      } else {
        // Success scenario
        setConflictMessage("");
        setStatus("Paths calculated successfully!");
        animatePaths(paths); // Start animation
      }
    } catch (error) {
      // Handle unexpected errors
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
    const animationInterval = setInterval(() => {
      if (step >= maxSteps) {
        clearInterval(animationInterval);
        setIsAnimating(false);
        return;
      }
      setAnimationIndex(step);
      step += 1;
    }, 500);
  };

  const clearPaths = () => {
    setPaths([]);
    setAnimationPaths([]);
    setAnimationIndex(0);
    setIsAnimating(false);
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
      {/* Animated Background */}
      <div className="gradient"></div>
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
      </div>

      <div className="App">
        <h1>Multi-Agent Pathfinding Visualizer</h1>
        <div className="algorithm-select">
          <label htmlFor="algorithm">Select Algorithm:</label>
          <select id="algorithm" value={selectedAlgorithm} disabled>
            <option value="CBS">Conflict-Based Search (CBS)</option>
            <option value="A*">A* Algorithm</option>
          </select>
        </div>
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
          paths={animationPaths.map((path) => path.slice(0, animationIndex + 1))}
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
        {paths.map((path, index) => (
          <p key={index}>
            <strong>Agent {index + 1}:</strong> {JSON.stringify(path)}
          </p>
        ))}
        <h3>Conflict Resolution</h3>
        {conflictDetails.length > 0 ? (
          conflictDetails.map((detail, index) => <p key={index}>{detail}</p>)
        ) : (
          <p>No conflicts detected.</p>
        )}
      </div>
    </div>
  );
}

export default App;
