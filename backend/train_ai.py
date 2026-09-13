import random
import numpy as np

from flood_model import (
    calculate_runoff,
    effective_capacity,
    calculate_surcharge,
    calculate_flood_depth
)

from drainage import create_drainage_network

from ml_model import flood_ai


def generate_training_data(samples=1000):

    graph = create_drainage_network()

    X = []
    y = []

    for _ in range(samples):

        rainfall = random.uniform(
            20,
            120
        )

        blockage = random.uniform(
            0,
            80
        )

        for node, data in graph.nodes(data=True):

            runoff = calculate_runoff(
                rainfall,
                data["area"]
            )

            capacity = effective_capacity(
                data["capacity"],
                blockage
            )

            surcharge = calculate_surcharge(
                runoff,
                capacity
            )

            depth = calculate_flood_depth(
                surcharge,
                data["area"]
            )

            features = [
                rainfall,
                blockage,
                data["capacity"],
                data["area"],
                runoff
            ]

            X.append(features)
            y.append(depth)

    return np.array(X), np.array(y)


if __name__ == "__main__":

    X, y = generate_training_data()

    flood_ai.train(X, y)

    print("AI surrogate model trained.")
    print("Training samples:", len(X))