from queue import PriorityQueue
from grid import get_neighbors

def heuristic(a, b):
    return abs(a[0] - b[0]) + abs(a[1] - b[1])

def reconstruct_path(came_from, start, goal):
    path = []
    current = goal
    while current != start:
        path.append(current)
        current = came_from[current]
    path.append(start)
    path.reverse()
    return path

def a_star(grid, start, goal, constraints=None):
    if constraints is None:
        constraints = set()

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
            if grid[neighbor] == 1 or (neighbor, cost_so_far[current] + 1) in constraints:
                continue
            new_cost = cost_so_far[current] + 1
            if neighbor not in cost_so_far or new_cost < cost_so_far[neighbor]:
                cost_so_far[neighbor] = new_cost
                priority = new_cost + heuristic(tuple(goal), neighbor)
                open_set.put((priority, neighbor))
                came_from[neighbor] = current

    return []
