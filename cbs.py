from cooperative_a_star import cooperative_a_star

def no_conflicts(paths):
    visited = {}
    for t, positions in enumerate(zip(*paths)):
        for i, pos in enumerate(positions):
            if (pos, t) in visited:
                return False
            visited[(pos, t)] = i
    return True

def find_conflict(paths):
    visited = {}
    for t, positions in enumerate(zip(*paths)):
        for i, pos in enumerate(positions):
            if (pos, t) in visited:
                return {
                    "time": t,
                    "pos": pos,
                    "agents": [i, visited[(pos, t)]],
                }
            visited[(pos, t)] = i
    return None

def cbs(grid, agents):
    root = {"constraints": [], "paths": cooperative_a_star(grid, agents)}
    queue = [root]

    while queue:
        node = queue.pop(0)

        if no_conflicts(node["paths"]):
            return node["paths"]

        conflict = find_conflict(node["paths"])
        if not conflict:
            continue

        for agent in conflict["agents"]:
            new_constraints = node["constraints"] + [
                {"agent": agent, "pos": conflict["pos"], "time": conflict["time"]}
            ]
            new_paths = cooperative_a_star(grid, agents, new_constraints)
            queue.append({"constraints": new_constraints, "paths": new_paths})

    return []
