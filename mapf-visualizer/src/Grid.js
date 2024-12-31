import React from "react";
import "./Grid.css";

const Grid = ({ rows, cols, gridData, paths, onCellClick, agents }) => (
  <div className="grid">
    {gridData.map((row, rowIndex) => (
      <div key={rowIndex} className="row">
        {row.map((cell, colIndex) => {
          let className = "cell";
          let content = ""; // To display `S1`, `G1`, etc.
          let backgroundColor = ""; // Custom path color for agents
          let borderColor = ""; // For goal borders before being reached

          // Check if this cell is a start or goal for any agent
          const agentHere = agents.find(
            (agent) =>
              (rowIndex === agent.start[0] && colIndex === agent.start[1]) ||
              (rowIndex === agent.goal[0] && colIndex === agent.goal[1])
          );

          if (agentHere) {
            const isStart =
              rowIndex === agentHere.start[0] && colIndex === agentHere.start[1];
            const isGoal =
              rowIndex === agentHere.goal[0] && colIndex === agentHere.goal[1];

            if (isStart) {
              content = `S${agentHere.id}`;
              backgroundColor = agentHere.color; // Start is always filled with the agent color
            }

            if (isGoal) {
              content = `G${agentHere.id}`;
              const agentIndex = agents.indexOf(agentHere);
              const isGoalReached =
                Array.isArray(paths[agentIndex]) && paths[agentIndex].length
                  ? paths[agentIndex].some(
                      ([pathRow, pathCol]) =>
                        pathRow === rowIndex && pathCol === colIndex
                    )
                  : false;

              if (isGoalReached) {
                backgroundColor = agentHere.color; // Fill with color if goal is reached
              } else {
                borderColor = agentHere.color; // Border color if not reached
              }
            }

            return (
              <div
                key={colIndex}
                className={`${className} ${isGoal ? "goal" : ""}`}
                style={{
                  backgroundColor,
                  borderColor,
                  borderStyle: isGoal && !backgroundColor ? "solid" : "none",
                }}
                onClick={() => onCellClick(rowIndex, colIndex)}
              >
                {content}
              </div>
            );
          }

          // Highlight path cells for different agents
          agents.forEach((agent, agentIndex) => {
            const agentPath = Array.isArray(paths[agentIndex]) ? paths[agentIndex] : []; // Ensure it's an array
            if (
              agentPath.some(
                ([pathRow, pathCol]) =>
                  pathRow === rowIndex && pathCol === colIndex
              )
            ) {
              backgroundColor = agent.color; // Use agent's assigned color for the path
            }
          });

          // Highlight obstacles
          if (cell === 1) {
            className += " obstacle";
          }

          return (
            <div
              key={colIndex}
              className={className}
              style={{ backgroundColor }}
              onClick={() => onCellClick(rowIndex, colIndex)}
            >
              {content}
            </div>
          );
        })}
      </div>
    ))}
  </div>
);

export default Grid;
