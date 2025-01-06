import gym
from gym import spaces
import numpy as np

class GridEnv(gym.Env):
    def __init__(self, grid, agent):
        super(GridEnv, self).__init__()
        self.grid = grid
        self.agent = agent
        self.action_space = spaces.Discrete(4)  # Up, Down, Left, Right
        self.observation_space = spaces.Box(low=0, high=1, shape=grid.shape, dtype=np.int)

    def step(self, action):
        dx, dy = [(0, -1), (0, 1), (-1, 0), (1, 0)][action]
        nx, ny = self.agent["position"][0] + dx, self.agent["position"][1] + dy

        if 0 <= nx < self.grid.shape[0] and 0 <= ny < self.grid.shape[1]:
            if self.grid[nx, ny] == 0: 
                self.agent["position"] = (nx, ny)
                reward = 1
                done = self.agent["position"] == self.agent["goal"]
                return self.grid, reward, done, {}

        return self.grid, -1, False, {} 

    def reset(self):
        self.agent["position"] = self.agent["start"]
        return self.grid
