from queue import PriorityQueue
from grid import get_neighbors
from a_star import reconstruct_path
from a_star import heuristic 

def weighted_a_star(grid, start, goal, weight=1.0):
    """
    Implements Weighted A* Algorithm.
    The heuristic is scaled by a weight factor to prioritize faster computation over path optimality.
    """
    rows, cols = grid.shape
    open_set = PriorityQueue()
    open_set.put((0, tuple(start)))
    came_from = {}
    cost_so_far = {tuple(start): 0}

    while not open_set.empty():
        _, current = open_set.get()

        if current == tuple(goal):
            return reconstruct_path(came_from, tuple(start), tuple(goal))

        for neighbor in get_neighbors(current, rows, cols, grid):
            if grid[neighbor] == 1: 
                continue
            new_cost = cost_so_far[current] + 1 
            if neighbor not in cost_so_far or new_cost < cost_so_far[neighbor]:
                cost_so_far[neighbor] = new_cost
                priority = new_cost + weight * heuristic(tuple(goal), neighbor)
                open_set.put((priority, neighbor))
                came_from[neighbor] = current

    return []  # Returns an empty path if no path exists
