from grid import create_grid
from cooperative_a_star import cooperative_a_star
from cbs import cbs
from visualize import visualize, visualize_heatmap
import numpy as np

def initialize_grid(rows, cols, obstacles):
    return create_grid(rows, cols, obstacles)

def run_simulation(grid, agents):
    return cbs(grid, agents)

def calculate_grid_usage(paths, grid_shape):
    grid_usage = np.zeros(grid_shape, dtype=int)
    for path in paths:
        for step in path:
            grid_usage[step[0], step[1]] += 1
    return grid_usage

def main():
    rows, cols = 10, 10
    obstacles = [(3, 3), (3, 4), (4, 4), (6, 7)]
    grid = initialize_grid(rows, cols, obstacles)

    agents = [
        {"id": 0, "start": (0, 0), "goal": (7, 7), "priority": 1},
        {"id": 1, "start": (9, 9), "goal": (2, 2), "priority": 2},
    ]

    paths = run_simulation(grid, agents)
    if paths and all(len(path) > 0 for path in paths):
        visualize(grid, paths)
        grid_usage = calculate_grid_usage(paths, grid.shape)
        visualize_heatmap(grid_usage)
    else:
        print("Error: Paths could not be found for all agents.")

if __name__ == "__main__":
    main()
