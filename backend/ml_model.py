import numpy as np
from sklearn.ensemble import RandomForestRegressor


class FloodSurrogateModel:

    def __init__(self):
        self.model = RandomForestRegressor(
            n_estimators=100,
            random_state=42
        )

        self.trained = False

    def train(self, X, y):

        self.model.fit(X, y)
        self.trained = True

    def predict(self, X):

        if not self.trained:
            raise RuntimeError(
                "Model has not been trained yet."
            )

        return self.model.predict(X)


flood_ai = FloodSurrogateModel()

def initialize_model():

    from train_ai import generate_training_data

    X, y = generate_training_data(
        samples=1000
    )

    flood_ai.train(X, y)