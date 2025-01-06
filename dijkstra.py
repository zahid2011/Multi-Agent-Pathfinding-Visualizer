from queue import PriorityQueue
from grid import get_neighbors

def dijkstra(grid, start, goal):
    rows, cols = grid.shape
    open_set = PriorityQueue()
    open_set.put((0, tuple(start)))  # Priority queue
    came_from = {}
    cost_so_far = {tuple(start): 0}

    while not open_set.empty():
        current_cost, current = open_set.get()

        if current == tuple(goal):
            return reconstruct_path(came_from, tuple(start), tuple(goal))

        for neighbor in get_neighbors(current, rows, cols, grid):
            if grid[neighbor] == 1: 
                continue
            new_cost = cost_so_far[current] + 1
            if neighbor not in cost_so_far or new_cost < cost_so_far[neighbor]:
                cost_so_far[neighbor] = new_cost
                open_set.put((new_cost, neighbor))
                came_from[neighbor] = current

    return [] 
def reconstruct_path(came_from, start, goal):
    """
    Reconstructs the path from the start to the goal using the `came_from` dictionary.
    """
    path = []
    current = goal
    while current != start:
        path.append(current)
        current = came_from.get(current) 
        if current is None: 
            raise ValueError("Path reconstruction failed. Ensure `came_from` is correct.")
    path.append(start)
    path.reverse()
    return path