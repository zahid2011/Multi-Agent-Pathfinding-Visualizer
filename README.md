# Multi-Agent Pathfinding Visualizer
This project, the **Multi-Agent Pathfinding Visualizer**, is an interactive tool designed to demonstrate and simulate various multi-agent pathfinding algorithms. It provides users with a graphical interface to visualize agents navigating through obstacles on a grid, allowing them to explore different algorithms and understand their behavior in resolving conflicts and finding optimal paths.

![MultiagentpathfindingdemoGIF1](https://github.com/user-attachments/assets/bd8b1201-3ef2-4915-a7e9-271d16aec945)


![multi-2](https://github.com/user-attachments/assets/20bd028a-e133-46e2-9f09-91114d705252)


---
## Table of Contents
1. [Features](#features)
2. [Technologies Used](#technologies-used)
3. [Installation](#installation)
   - [Prerequisites](#prerequisites)
   - [Steps](#steps)
   - [Install Dependencies](#install-dependencies)
   - [Run the Application](#run-the-application)
4. [How to Use](#how-to-use)
5. [Algorithms Explained](#algorithms-explained)
6. [Contact](#contact)

---
## Features
- **Dynamic Grid Control**: Customize the grid size and set obstacles.
- **Multiple Agents**: Add or remove agents and assign individual start and goal positions.
- **Algorithm Selection**: Simulate pathfinding using different algorithms:
  - A*
  - Weighted A*
  - Dijkstra
  - Greedy Best-First Search
  - Conflict-Based Search (CBS)
- **Conflict Detection**: Identify conflicts in agent paths and visualize resolution.
- **Visualization**: Real-time animation of agents navigating through the grid.
- **Responsive Design**: Intuitive and user-friendly interface.

---

## Technologies Used
- **Frontend**: React.js
- **Backend**: Flask
- **Pathfinding Algorithms**: Python
- **Styling**: CSS
- **Visualization**: Matplotlib, Seaborn

---

## Installation

### Prerequisites
Ensure you have the following installed on your system:
- Node.js
- Python 3.12.8
- pip
- Flask

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/Multi-Agent-Pathfinding-Visualizer.git
2. Navigate to the project directory:
   ```bash
   cd Multi-Agent-Pathfinding-Visualizer
### Install Dependencies

#### Frontend:
```bash
cd frontend
npm install
```
#### Backend:
```bash
flask run
```

### Run the Application:
#### Backend:
```bash
flask run
```
#### Frontend:
```bash
cd frontend
npm start
```
### Running:
Open your browser and navigate to http://localhost:3000.

## How to Use

1. **Set Grid Size**: Define the number of rows and columns for the grid.
2. **Place Obstacles**: Click on cells to toggle obstacles.
3. **Add Agents**: Use the sidebar to add agents and set their start and goal positions.
4. **Select Algorithm**: Choose a pathfinding algorithm from the dropdown menu.
5. **Run Simulation**: Click "Run Simulation" to visualize agent movements.
6. **Clear Paths**: Reset the paths and start over.

---

## Algorithms Explained

1. **A***:
   - Uses heuristics to find the shortest path efficiently.
2. **Weighted A***:
   - A variant of A* with adjustable heuristic weight for faster computation at the cost of optimality.
3. **Dijkstra**:
   - Guarantees the shortest path by exploring all nodes.
4. **Greedy Best-First Search**:
   - Focuses solely on the heuristic value, prioritizing exploration towards the goal.
5. **Conflict-Based Search (CBS)**:
   - Resolves multi-agent conflicts using hierarchical constraints.

---

## Contact

For questions or suggestions, feel free to reach out:
- **Email**: zahidhossain708@gmail.com
