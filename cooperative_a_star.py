from a_star import a_star

def cooperative_a_star(grid, agents, constraints=None):
    if constraints is None:
        constraints = []
    shared_map = {}
    paths = []

    for agent in agents:
        agent_constraints = [
            (constraint["pos"], constraint["time"])
            for constraint in constraints
            if constraint["agent"] == agent["id"]
        ]
        path = a_star(grid, agent["start"], agent["goal"], set(agent_constraints))
        if not path:
            return []
        for t, step in enumerate(path):
            shared_map[(step, t)] = agent["id"]
        paths.append(path)

    return paths
