from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ml_model import flood_ai, initialize_model

initialize_model()

from flood_model import (
    calculate_runoff,
    effective_capacity,
    calculate_surcharge,
    flood_risk,
    calculate_flood_depth,
    calculate_flood_eta
)

from drainage import create_drainage_network
from routing import find_safe_route
from surface_model import generate_flood_grid, get_dem


app = FastAPI(title="Urban Flood Nowcasting API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SimulationRequest(BaseModel):

    rainfall: float
    blockage: float
    forecast_minutes: int


@app.get("/")
def home():

    return {
        "system": "Urban Flood Nowcasting System",
        "status": "online"
    }


@app.post("/simulate")
def simulate(request: SimulationRequest):

    graph = create_drainage_network()

    results = []

    for node, data in graph.nodes(data=True):

        # Rainfall → runoff
        runoff = calculate_runoff(
            request.rainfall,
            data["area"]
        )

        # Account for blockage
        capacity = effective_capacity(
            data["capacity"],
            request.blockage
        )

        # Hydraulic failure
        surcharge = calculate_surcharge(
            runoff,
            capacity
        )

        # Risk classification
        risk = flood_risk(
            runoff,
            capacity
        )

        # Flood depth
        depth = calculate_flood_depth(
            surcharge,
            data["area"]
        )

        # Flood ETA
        eta = calculate_flood_eta(
            depth,
            request.rainfall
        )

        results.append({

            "node": node,

            "runoff": round(
                runoff,
                5
            ),

            "capacity": round(
                capacity,
                5
            ),

            "surcharge": round(
                surcharge,
                5
            ),

            "risk": risk,

            "flood_depth_cm": depth,

            "flood_eta_min": eta
        })
        flood_grid = generate_flood_grid(results)

    return {
        "rainfall": request.rainfall,
        "blockage": request.blockage,
        "forecast_minutes": request.forecast_minutes,
        "nodes": results,
        "flood_grid": flood_grid
    }


@app.post("/forecast")
def forecast_flood(request: SimulationRequest):

    graph = create_drainage_network()

    forecast_results = []

    time_steps = [0, 30, 60, 90, 120, 150, 180]

    for minutes in time_steps:

        # Simple prototype rainfall evolution.
        # Rainfall gradually changes through the
        # forecast window.

        time_factor = 1 + (minutes / 180) * 0.25

        future_rainfall = (
            request.rainfall * time_factor
        )

        nodes = []

        for node, data in graph.nodes(data=True):

            runoff = calculate_runoff(
                future_rainfall,
                data["area"]
            )

            capacity = effective_capacity(
                data["capacity"],
                request.blockage
            )

            surcharge = calculate_surcharge(
                runoff,
                capacity
            )

            risk = flood_risk(
                runoff,
                capacity
            )

            depth = calculate_flood_depth(
                surcharge,
                data["area"]
            )

            eta = calculate_flood_eta(
                depth,
                future_rainfall
            )

            nodes.append({

                "node": node,

                "runoff": round(
                    runoff,
                    5
                ),

                "capacity": round(
                    capacity,
                    5
                ),

                "surcharge": round(
                    surcharge,
                    5
                ),

                "risk": risk,

                "flood_depth_cm": depth,

                "flood_eta_min": eta

            })

        flood_grid = generate_flood_grid(
            nodes
        )

        forecast_results.append({

            "time_min": minutes,

            "rainfall": round(
                future_rainfall,
                2
            ),

            "nodes": nodes,

            "flood_grid": flood_grid

        })

    return {
        "forecast": forecast_results
    }


@app.post("/route")
def safe_route(request: dict):

    start = request.get("start", "A")
    destination = request.get("destination", "F")

    flood_grid = request.get(
        "flood_grid",
        []
    )

    return find_safe_route(
        start,
        destination,
        flood_grid
    )
@app.get("/dem")
def get_dem_data():
    return {
        "dem": get_dem()
    }

@app.post("/ai_predict")
def ai_predict(request: dict):

    rainfall = request.get(
        "rainfall",
        60
    )

    blockage = request.get(
        "blockage",
        20
    )

    graph = create_drainage_network()

    predictions = []

    for node, data in graph.nodes(data=True):

        runoff = calculate_runoff(
            rainfall,
            data["area"]
        )

        features = [[
            rainfall,
            blockage,
            data["capacity"],
            data["area"],
            runoff
        ]]

        prediction = flood_ai.predict(
            features
        )[0]

        predictions.append({
            "node": node,
            "predicted_depth_cm": round(
                float(prediction),
                2
            )
        })

    return {
        "model": "Random Forest Surrogate",
        "predictions": predictions
    }