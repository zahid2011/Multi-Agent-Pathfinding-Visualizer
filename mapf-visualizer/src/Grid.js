import React from "react";
import "./Grid.css";

const Grid = ({ rows, cols, gridData, paths, onCellClick, agents }) => (
  <div className="grid">
    {gridData.map((row, rowIndex) => (
      <div key={rowIndex} className="row">
        {row.map((cell, colIndex) => {
          let className = "cell";
          let content = ""; 
          let backgroundColor = ""; // Custom path color for agents
          let borderColor = ""; 
          // Checking if this cell is a start or goal for any agent
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
              backgroundColor = agentHere.color; 
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
                backgroundColor = agentHere.color; 
              } else {
                borderColor = agentHere.color;
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
          agents.forEach((agent, agentIndex) => {
            const agentPath = Array.isArray(paths[agentIndex]) ? paths[agentIndex] : [];
            if (
              agentPath.some(
                ([pathRow, pathCol]) =>
                  pathRow === rowIndex && pathCol === colIndex
              )
            ) {
              backgroundColor = agent.color;
            }
          });
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
