from queue import PriorityQueue
from grid import get_neighbors
from a_star import reconstruct_path
from a_star import heuristic 

def greedy_best_first(grid, start, goal):
    """
    Implements Greedy Best-First Search.
    Prioritizes exploration based only on the heuristic function.
    """
    rows, cols = grid.shape
    open_set = PriorityQueue()
    open_set.put((0, tuple(start)))
    came_from = {}
    visited = set()
    visited.add(tuple(start))

    while not open_set.empty():
        _, current = open_set.get()

        if current == tuple(goal):
            return reconstruct_path(came_from, tuple(start), tuple(goal))

        for neighbor in get_neighbors(current, rows, cols, grid):
            if neighbor in visited or grid[neighbor] == 1:
                continue
            visited.add(neighbor)
            priority = heuristic(tuple(goal), neighbor)  
            open_set.put((priority, neighbor))
            came_from[neighbor] = current

    return [] 
