import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

def visualize(grid, paths, conflicts=None):
    agent_colors = ["red", "blue", "green", "orange", "purple", "yellow", "pink", "cyan"]

    for t in range(max(len(path) for path in paths)):
        plt.imshow(grid, cmap="gray")

        for i, path in enumerate(paths):
            if t < len(path):
                x, y = path[t]
                plt.text(
                    y, x, str(i),
                    color=agent_colors[i % len(agent_colors)],
                    ha="center", va="center", fontweight="bold"
                )
        plt.pause(0.5)
        plt.clf()

def visualize_heatmap(grid_usage):
    sns.heatmap(grid_usage, annot=True, cmap="coolwarm", cbar=True)
    plt.title("Grid Usage Heatmap")
    plt.xlabel("Columns")
    plt.ylabel("Rows")
    plt.show()
