import numpy as np

def create_grid(rows, cols, obstacles):
    grid = np.zeros((rows, cols))
    for (x, y) in obstacles:
        grid[x][y] = 1
    return grid

def get_neighbors(cell, rows, cols, grid):
    x, y = cell
    neighbors = []
    for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
        nx, ny = x + dx, y + dy
        if 0 <= nx < rows and 0 <= ny < cols and grid[nx][ny] == 0:
            neighbors.append((nx, ny))
    return neighbors
