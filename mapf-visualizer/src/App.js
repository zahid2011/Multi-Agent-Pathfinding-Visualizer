import React, { useState } from "react";
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

  // Start with one agent by default
  const [agents, setAgents] = useState([
    { id: 1, start: [0, 0], goal: [9, 9], color: "#007bff" },
  ]);

  const [selectedAgent, setSelectedAgent] = useState(1);
  const [paths, setPaths] = useState([]);
  const [animationPaths, setAnimationPaths] = useState([]);
  const [conflictMessage, setConflictMessage] = useState("");
  const [mode, setMode] = useState("obstacle");
  const [animationIndex, setAnimationIndex] = useState(0); // Tracks animation progress
  const [isAnimating, setIsAnimating] = useState(false);
  const [algoInfo, setAlgoInfo] = useState(""); // Algorithm details
  const [conflictDetails, setConflictDetails] = useState([]); // Steps explaining conflict resolution

  // Add Agent Functionality
  const addAgent = () => {
    const newAgentId = agents.length + 1; // Unique agent ID
    setAgents([
      ...agents,
      {
        id: newAgentId,
        start: [0, 0], // Default start position
        goal: [rows - 1, cols - 1], // Default goal position
        color: getRandomColor(), // Assign a random color
      },
    ]);
    setSelectedAgent(newAgentId); // Select the newly added agent
  };

  // Remove Agent Functionality
  const removeAgent = () => {
    if (agents.length <= 1) {
      setConflictMessage("At least one agent must be present.");
      return;
    }
    const updatedAgents = agents.filter((agent) => agent.id !== selectedAgent);
    setAgents(updatedAgents);

    // Automatically select the first agent in the updated list
    setSelectedAgent(updatedAgents[0]?.id || 1);
  };

  // Utility function to generate random colors for agents
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
      setPaths([]);
      setAnimationPaths([]);
      setAnimationIndex(0);
      setIsAnimating(false);
      setAlgoInfo("");
      setConflictDetails([]);

      const obstacles = gridData.reduce((acc, row, rowIndex) => {
        return acc.concat(
          row.map((cell, colIndex) => (cell === 1 ? [rowIndex, colIndex] : null)).filter(Boolean)
        );
      }, []);

      const response = await axios.post("http://127.0.0.1:5000/solve", {
        rows,
        cols,
        obstacles,
        agents,
      });

      const { paths, conflict, algoDetails, conflictSteps } = response.data;

      setPaths(paths || []);
      setAlgoInfo(algoDetails || "Unknown Algorithm");
      setConflictDetails(conflictSteps || []);

      if (conflict) {
        setConflictMessage("Conflict detected: Some agents could not find paths.");
      } else {
        setConflictMessage("Paths calculated successfully!");
        animatePaths(paths); // Start animation
      }
    } catch (error) {
      console.error("Error running simulation:", error);
      setConflictMessage("An error occurred during simulation. Please try again.");
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
    }, 500); // Adjust animation speed here (500ms per step)
  };

  const clearPaths = () => {
    setPaths([]);
    setAnimationPaths([]);
    setAnimationIndex(0);
    setIsAnimating(false);
    setConflictMessage("");
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
      {/* Left Sidebar for Agent Controls */}
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

      {/* Add Agent Button */}
      <button 
        className="add-agent-btn" // Add the class for blue styling
        onClick={addAgent}
      >
        Add Agent
      </button>

      {/* Remove Agent Button */}
      <button 
        className="remove-agent-btn" // Add the class for red styling
        onClick={removeAgent} 
        disabled={agents.length <= 1}
      >
        Remove Agent
      </button>
    </div>

      {/* Main Center Area */}
      <div className="App">
        <h1>Multi-Agent Pathfinding Visualizer</h1>
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
        {conflictMessage && <p className="conflict-message">{conflictMessage}</p>}
      </div>

      {/* Right Sidebar for Simulation Details */}
      <div className="sidebar">
        <h2>Simulation Details</h2>
        <p>
          <strong>Algorithm Used:</strong> Conflict-Based Search (CBS)
        </p>
        {conflictMessage && <p><strong>Status:</strong> {conflictMessage}</p>}
        <h3>Paths</h3>
        {paths.map((path, index) => (
          <p key={index}>
            <strong>Agent {index + 1}:</strong> {JSON.stringify(path)}
          </p>
        ))}
        <h3>Conflict Resolution</h3>
        {conflictDetails.length > 0 ? (
          conflictDetails.map((detail, index) => (
            <p key={index}>{detail}</p>
          ))
        ) : (
          <p>No conflicts detected.</p>
        )}
      </div>
    </div>
  );
}

export default App;
