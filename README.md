# Urban Flood Nowcasting System

### SIH26085 – Smart India Hackathon 2026

**Theme:** Disaster Management  
**Category:** Software  
**Ministry:** Ministry of Earth Sciences (MoES)

---

## Overview

Urban flooding is a highly localized problem. Knowing how much rainfall is expected does not necessarily indicate which streets will flood, how deep the water will become, when flooding will begin, or which roads will remain safe for movement.

The **Urban Flood Nowcasting System** is a prototype designed to address this problem by coupling rainfall, surface runoff, terrain, drainage-network capacity, blockage conditions, and road accessibility into a single decision-support system.

The system demonstrates an end-to-end pipeline:

```text
Rainfall
    ↓
Rainfall Nowcasting
    ↓
Surface Runoff
    ↓
DEM / Terrain
    ↓
Directed Drainage Network
    ↓
Hydraulic Capacity Analysis
    ↓
Blockage / Capacity Exceeded
    ↓
Surcharge & Backflow
    ↓
Surface Flooding
    ↓
Flood Depth + Flood ETA
    ↓
GIS Dashboard
    ↓
Flood-Safe Routing

The current implementation is a working prototype using representative and simulated data. The architecture is designed to support integration with high-resolution Doppler Weather Radar, real DEM/GIS data, municipal drainage networks, and historical flood observations in a future deployment.

Problem Statement

Urban flooding in major Indian cities is becoming increasingly difficult to manage because the impact of rainfall depends on much more than rainfall intensity alone.

Traditional rainfall or weather forecasting systems can indicate that heavy rainfall is expected, but they do not directly answer operational questions such as:

Which streets are likely to flood?
How deep could the water become?
When is flooding likely to begin?
Which drainage locations may become overloaded?
How do blocked or undersized drains affect surface flooding?
Which roads should emergency services avoid?
What alternative routes can be used?

Urban flood behaviour is influenced by:

High-resolution rainfall patterns
Micro-topography
Digital Elevation Models (DEM)
Land use and impervious surfaces
Drainage network structure
Drainage capacity
Blockages and infrastructure constraints
Surface water flow
Road-network connectivity

The proposed system aims to combine these factors into a short-term 0–3 hour urban flood nowcasting and decision-support framework.

Proposed Solution

The system models an urban area as an interaction between the surface environment and the underground drainage network.

Rainfall is converted into runoff based on the affected area and runoff characteristics. The runoff is then compared against drainage capacity represented using a directed graph.

When runoff exceeds the available drainage capacity, the system calculates the resulting surcharge and estimates potential surface flooding.

A DEM-informed flood grid is then used to spatially distribute the estimated flooding. The resulting flood information is displayed through an interactive GIS dashboard.

The flood grid is also used to evaluate road conditions. Roads exposed to higher predicted flood depths receive higher routing costs or are treated as blocked, allowing the routing engine to select a safer alternative.

Key Features
1. Rainfall-Based Flood Simulation

The system accepts rainfall intensity as an input and calculates the resulting runoff for different locations.

The prototype supports scenario-based rainfall inputs for demonstrating changing flood conditions.

The architecture is designed to accept high-resolution rainfall nowcasts from Doppler Weather Radar in a production implementation.

2. 0–3 Hour Flood Forecast

The dashboard provides a timeline covering the next three hours.

Users can move through different forecast time steps and observe changes in:

Rainfall
Runoff
Drainage capacity
Surcharge
Flood risk
Flood depth
Flood ETA
Surface flood distribution

The current prototype uses a simulated rainfall trajectory to demonstrate this forecast workflow.

3. DEM-Informed Surface Modelling

A representative Digital Elevation Model (DEM) is used to introduce terrain information into the flood visualization.

Lower-elevation areas receive greater influence during the spatial distribution of flood water.

This demonstrates the intended coupling between:

Terrain
   +
Flood Source
   ↓
Spatial Flood Distribution

The current implementation uses a simplified DEM-informed spatial approximation rather than a full calibrated 2D hydraulic solver.

4. Directed Drainage Network

The stormwater drainage network is represented as a directed graph.

Nodes

Nodes represent locations such as:

Manholes
Inlets
Drainage junctions
Edges

Edges represent:

Pipes
Canals
Drainage connections

The directed structure represents the intended direction of water movement through the drainage system.

The prototype uses NetworkX to construct and analyse this graph.

5. Drainage Capacity Analysis

Each drainage node is assigned a representative drainage capacity.

The system compares calculated runoff with the effective drainage capacity.

The effective capacity is reduced when blockage is introduced.

Effective Capacity =
Original Capacity × (1 − Blockage Percentage)

This allows the system to demonstrate how infrastructure restrictions can increase flood risk even under the same rainfall conditions.

6. Blockage and Surcharge Modelling

Drainage blockage can be dynamically changed through the dashboard.

When runoff exceeds the available drainage capacity:

Runoff > Effective Capacity
             ↓
          Surcharge
             ↓
       Potential Backflow
             ↓
       Surface Flooding

This provides a simple representation of one of the major mechanisms contributing to urban flooding.

7. Flood Risk Classification

The system classifies drainage conditions according to the ratio between runoff and drainage capacity.

The current prototype uses:

Runoff / Capacity Ratio	Risk
≤ 0.8	LOW
> 0.8 and ≤ 1.0	MODERATE
> 1.0 and ≤ 1.2	HIGH
> 1.2	CRITICAL

These thresholds are configurable prototype assumptions and would require calibration against real hydraulic and historical flood observations before operational deployment.

8. Flood Depth Estimation

When drainage capacity is exceeded, the system estimates an indicative flood depth in centimetres.

Flood depth is derived from excess runoff volume and a representative surface accumulation area.

The resulting values are displayed at drainage locations and visualized spatially using the flood grid.

The current implementation is intended for prototype demonstration and is not a calibrated physical flood-depth prediction model.

9. Flood ETA

The dashboard provides an estimated Flood ETA representing the approximate time associated with the onset of significant flooding.

The ETA is displayed in minutes for locations where flooding is predicted.

The current ETA calculation is a prototype approximation and should be replaced by a calibrated time-dependent hydraulic/nowcasting model for real-world deployment.

10. Interactive GIS Dashboard

The frontend provides an interactive map for visualizing:

Drainage nodes
Drainage connections
Flooded areas
Flood depth
Flood risk
Road conditions
Safe routes
Forecast conditions

Users can modify rainfall and blockage conditions and observe the resulting changes.

11. Flood-Safe Routing

The system incorporates predicted flood conditions into road routing.

Each prototype road is evaluated against the flood grid and assigned a flood condition:

Flood Depth	Road Status
< 10 cm	SAFE
10–20 cm	CAUTION
20–30 cm	HIGH RISK
≥ 30 cm	BLOCKED

Flooded roads receive increased routing costs, while blocked roads are excluded from the route.

A shortest-path algorithm is then used to identify a safer alternative route.

The thresholds are representative prototype values and should be calibrated according to road characteristics, vehicle type, and emergency-service requirements.

12. What-If Scenario Simulation

The dashboard allows users to experiment with different conditions.

Example parameters include:

Rainfall intensity
Drainage blockage
Forecast duration

This allows authorities or users to explore questions such as:

What happens if rainfall increases?

What happens if a drainage location becomes partially blocked?

Which roads become unsafe under a severe rainfall scenario?

System Architecture
                    ┌────────────────────────┐
                    │   Rainfall Input       │
                    │ / Radar Nowcast Input  │
                    └────────────┬───────────┘
                                 ↓
                    ┌────────────────────────┐
                    │ Rainfall Nowcasting     │
                    │       0–3 Hours        │
                    └────────────┬───────────┘
                                 ↓
              ┌────────────────────────────────────┐
              │ DEM + Land Use + Imperviousness    │
              └──────────────────┬─────────────────┘
                                 ↓
                    ┌────────────────────────┐
                    │ Surface Runoff Model   │
                    └────────────┬───────────┘
                                 ↓
                    ┌────────────────────────┐
                    │ Directed Drainage Graph │
                    │ Manholes / Pipes /      │
                    │ Canals                  │
                    └────────────┬───────────┘
                                 ↓
                    ┌────────────────────────┐
                    │ Hydraulic Capacity     │
                    │ Analysis               │
                    └────────────┬───────────┘
                                 ↓
                    ┌────────────────────────┐
                    │ Blockage / Overcapacity│
                    │ Detection               │
                    └────────────┬───────────┘
                                 ↓
                    ┌────────────────────────┐
                    │ Surcharge & Backflow    │
                    └────────────┬───────────┘
                                 ↓
                    ┌────────────────────────┐
                    │ Surface Flood Model     │
                    └────────────┬───────────┘
                                 ↓
                ┌────────────────┴─────────────────┐
                ↓                                  ↓
       ┌────────────────────┐            ┌────────────────────┐
       │ GIS Dashboard      │            │ Flood-Safe Routing │
       │ Depth + Risk + ETA │            │ Emergency Routes   │
       └────────────────────┘            └────────────────────┘
Methodology
Step 1 – Rainfall Input

Rainfall intensity is provided as an input to the prototype.

The production architecture is designed to accept high-resolution rainfall nowcasts generated from Doppler Weather Radar systems.

Step 2 – Runoff Calculation

Rainfall is converted into runoff using a simplified rainfall-runoff relationship:

Runoff = Rainfall × Area × Runoff Coefficient

The prototype uses representative areas and runoff coefficients.

Step 3 – Drainage Network Representation

The stormwater network is represented using a directed NetworkX graph.

Each node contains parameters such as:

Drainage capacity
Contributing area

Connections between nodes represent the direction of drainage flow.

Step 4 – Capacity Reduction

Blockage reduces the available drainage capacity:

Effective Capacity =
Capacity × (1 − Blockage / 100)
Step 5 – Surcharge Calculation

When runoff exceeds effective capacity:

Surcharge =
max(0, Runoff − Effective Capacity)

A positive surcharge indicates that the drainage system is unable to accommodate all incoming runoff under the current scenario.

Step 6 – Flood Depth Estimation

The excess flow is converted into an indicative excess water volume over a representative accumulation period.

The prototype then estimates a flood depth in centimetres.

Step 7 – DEM-Informed Spatial Flooding

Flood depth is distributed across a representative spatial grid using:

Flood source location
Distance from the source
Local elevation

This generates a flood grid that can be visualized on the map.

Step 8 – Road Flood Assessment

The flood grid is evaluated against the prototype road network.

Each road receives an estimated flood depth and status.

Step 9 – Safe Route Calculation

Roads with severe flooding are penalized or removed from the routing network.

A shortest-path algorithm is then used to identify an alternative route.

AI / Machine Learning Component

The prototype includes a Random Forest-based flood surrogate model.

The model is designed to demonstrate how machine learning can act as an acceleration layer for flood prediction.

Input Features

The current model uses:

Rainfall intensity
Blockage percentage
Drainage capacity
Contributing area
Calculated runoff
Output
Predicted Flood Depth (cm)
Current Training Approach

The current AI model is trained using synthetic scenarios generated from the prototype physics-based calculations.

This allows the project to demonstrate the integration of a machine-learning surrogate without claiming that the model has already been trained on real municipal flood observations.

In a production system, the model could be trained and validated using historical:

Rainfall observations
Radar nowcasts
Flood observations
Water-level measurements
Drainage sensor data
DEM/GIS information
Municipal drainage characteristics

The intended architecture is therefore:

Physics / Hydraulic Model
          ↓
Reference Behaviour
          ↓
AI Surrogate
          ↓
Faster Prediction

rather than replacing physical constraints entirely with AI.

Technology Stack
Frontend
Next.js
React
JavaScript
Tailwind CSS
Leaflet
React Leaflet
Backend
Python
FastAPI
NetworkX
NumPy
Machine Learning
Scikit-learn
Random Forest
Flood Modelling
Rainfall-runoff calculations
Drainage capacity modelling
Surcharge calculation
DEM-informed spatial flood approximation
Routing
NetworkX
Shortest-path routing
Future Production Technologies

The system can be extended using:

EPA SWMM
PostGIS
Doppler Weather Radar data
High-resolution DEM/GIS datasets
OpenStreetMap
OSRM
Spatial-temporal deep learning models
Project Structure
urban-flood-nowcasting/
│
├── backend/
│   ├── main.py
│   ├── flood_model.py
│   ├── drainage.py
│   ├── surface_model.py
│   ├── routing.py
│   ├── ml_model.py
│   └── train_ai.py
│
├── frontend/
│   └── app/
│       ├── page.js
│       └── MapComponent.js
│
├── data/
│
├── README.md
└── .gitignore
Installation and Setup
Prerequisites

Make sure the following are installed:

Python 3.9+
Node.js
npm
Git
Backend Setup

Open a terminal and navigate to the backend:

cd backend

Create a Python virtual environment:

python -m venv venv
Windows
venv\Scripts\activate
macOS / Linux
source venv/bin/activate

Install the required Python packages:

pip install fastapi uvicorn networkx numpy scikit-learn

Start the backend:

uvicorn main:app --reload

The backend will run at:

http://127.0.0.1:8000

FastAPI API documentation is available at:

http://127.0.0.1:8000/docs
Frontend Setup

Open another terminal:

cd frontend

Install dependencies:

npm install

Start the development server:

npm run dev

The frontend will run at:

http://localhost:3000

Open the above address in a browser to access the dashboard.

API Endpoints
/simulate
Method
POST
Purpose

Runs a flood simulation for a given rainfall and blockage condition.

Example Input
{
  "rainfall": 80,
  "blockage": 30,
  "forecast_minutes": 60
}
Example Outputs

The simulation returns information such as:

Runoff
Effective drainage capacity
Surcharge
Risk level
Flood depth
Flood ETA
Flood grid
/forecast
Method
POST
Purpose

Generates a time-based flood forecast over the prototype's 0–3 hour timeline.

The current prototype evaluates multiple time steps:

0 min
30 min
60 min
90 min
120 min
150 min
180 min

The rainfall trajectory is currently simulated for demonstration.

/route
Method
POST
Purpose

Calculates a flood-aware route between two locations.

Example Input
{
  "start": "A",
  "destination": "F",
  "flood_grid": []
}

The routing engine evaluates road flood conditions and calculates a safer path.

/dem
Method
GET
Purpose

Returns the representative DEM used by the prototype.

/ai_predict
Method
POST
Purpose

Generates flood-depth predictions using the Random Forest surrogate model.

Example Input
{
  "rainfall": 80,
  "blockage": 30
}
Prototype Demo Scenarios

The following representative scenarios can be used to demonstrate the system.

Scenario	Rainfall	Blockage	Expected Behaviour
Baseline	40 mm/hr	0%	Low/stable drainage conditions
Stressed	60 mm/hr	20%	Increased drainage utilization
Heavy	80 mm/hr	30%	Increased flood risk
Failure	100 mm/hr	60%	Severe drainage stress

These values are representative prototype scenarios and are not measurements from a municipal drainage network.

Current MVP Status
Component	Status
Rainfall simulation	Implemented
Runoff calculation	Implemented
Directed drainage graph	Implemented
Drainage capacity analysis	Implemented
Blockage simulation	Implemented
Surcharge calculation	Implemented
Flood risk classification	Implemented
DEM-informed flood grid	Implemented
Flood depth estimation	Implemented
Flood ETA	Prototype
Interactive GIS dashboard	Implemented
Flood-safe routing	Implemented
What-if simulation	Implemented
Random Forest surrogate	Prototype
Live Doppler radar integration	Future
Real municipal drainage network	Future
Full 2D hydraulic solver	Future
Historical flood-data training	Future
Limitations

The current project is a prototype intended to demonstrate the complete system concept.

The following limitations apply:

1. Rainfall Data

The current prototype uses simulated rainfall input.

It does not currently ingest live Doppler Weather Radar data.

2. DEM

The current DEM is a representative prototype grid.

A production deployment would require a high-resolution DEM for the target urban area.

3. Drainage Network

The current drainage network contains representative nodes, connections, capacities, and contributing areas.

These are not measurements of an actual municipal drainage system.

4. Surface Flood Model

The current flood surface is a simplified DEM-informed spatial approximation.

It is not a calibrated full 2D hydraulic solver.

A production system could integrate a physically based 2D surface model and/or calibrated hydraulic tools such as EPA SWMM for appropriate drainage-system modelling.

5. Flood ETA

The current Flood ETA is a prototype estimate.

A real deployment would require time-dependent hydraulic modelling and validation against observed flood onset times.

6. AI Model

The Random Forest surrogate is trained on synthetic physics-generated scenarios.

It is not currently trained on a large historical municipal flood dataset.

7. Road Flooding

Road flood depths are currently estimated by intersecting the prototype road network with the generated flood grid.

A production implementation would use actual road geometry and spatial GIS intersection.

8. Routing Thresholds

Road safety thresholds are representative values for the prototype.

Actual emergency routing should consider:

Vehicle type
Road elevation
Road geometry
Vehicle clearance
Flow velocity
Road condition
Emergency-service requirements
Future Scope
Phase 1 – Prototype

The current phase demonstrates:

Rainfall input
Runoff calculation
Drainage graph
Capacity analysis
Blockage modelling
Flood depth
Flood ETA
GIS visualization
Safe routing
AI surrogate
Phase 2 – Real Data Integration

The next stage would integrate:

Doppler Weather Radar rainfall nowcasts
High-resolution DEM
Land-use data
Imperviousness information
Municipal drainage GIS
Historical rainfall
Historical flood observations
Water-level observations
Phase 3 – Hydraulic Model Integration

A physically based hydraulic modelling layer can be introduced using tools such as:

EPA SWMM
1D drainage modelling
2D surface inundation modelling
Coupled 1D–2D hydraulic modelling

This would improve the physical representation of drainage surcharge, surface flow and flood propagation.

Phase 4 – AI Enhancement

Future machine-learning models could include:

Spatial-temporal flood prediction
Graph Neural Networks for drainage networks
CNN/ConvLSTM-based rainfall-to-flood modelling
AI surrogate models for faster inference
Uncertainty estimation
Continuous model updating

AI would complement rather than replace physical and hydraulic constraints.

Phase 5 – Real-Time Deployment

A production system could provide:

Live Radar
     ↓
Rainfall Nowcast
     ↓
Hydraulic / AI Prediction
     ↓
Flood Depth
     ↓
Flood ETA
     ↓
Street-Level Alerts
     ↓
Emergency Routing

Potential users include:

Municipal authorities
Disaster management agencies
Emergency services
Police and fire departments
Public transport authorities
Traffic management centres
Citizens
Validation Strategy

Before operational deployment, the system should be validated against historical and observed events.

Flood Depth

Possible evaluation metrics:

Mean Absolute Error (MAE)
Root Mean Square Error (RMSE)
Flood Extent

Possible evaluation metrics:

Intersection over Union (IoU)
Precision
Recall
F1-score
Flood Hotspot Detection

Evaluation can compare predicted critical locations against known historical flood-prone locations.

Flood ETA

Predicted flood onset time can be compared against observed flood onset.

Possible metric:

Mean Absolute Error of Flood Onset Time
Routing

The routing system can be evaluated using:

Travel time
Number of flooded roads avoided
Route distance
Route safety
Emergency accessibility
SIH26085 Problem Statement Alignment
SIH Requirement	Project Implementation
0–3 hour urban flood nowcasting	0–180 minute forecast timeline
High-resolution rainfall information	Radar-ready rainfall architecture
DEM/GIS integration	DEM-informed flood grid
Underground drainage network	Directed graph representation
Nodes as drainage locations	Prototype manhole/inlet nodes
Pipes/canals as network connections	Directed graph edges
Hydraulic capacity	Capacity and utilization analysis
Drainage blockage	Dynamic blockage parameter
Overcapacity detection	Runoff-to-capacity comparison
Surcharge/backflow	Surcharge modelling
Surface flooding	DEM-informed flood grid
Street-level flood information	Road flood-depth assessment
Flood depth	Depth displayed in centimetres
Flood ETA	Prototype ETA calculation
Dynamic GIS dashboard	Interactive web dashboard
Flood-safe routes	Risk-aware shortest-path routing
Emergency-service support	Flood-aware alternative routes
Innovation and Uniqueness

The primary innovation of the proposed system is not simply predicting rainfall or displaying flood maps.

It focuses on coupling rainfall with the behaviour of the urban drainage and surface systems.

The system combines:

Rainfall
    +
Terrain
    +
Surface Runoff
    +
Drainage Network
    +
Drainage Capacity
    +
Blockage
    +
Surcharge / Backflow
    +
Road Accessibility

This enables the system to move from:

"It is going to rain heavily."

to:

"These locations are likely to experience drainage stress and surface flooding, with estimated depth and timing, while these roads provide safer alternatives."

Expected Impact
Municipal Authorities
Early identification of potential flood hotspots
Identification of overloaded drainage locations
Support for proactive drainage maintenance
Improved flood-response planning
Emergency Services
Identification of flood-prone roads
Flood-aware alternative routing
Improved emergency accessibility
Citizens
Street-level flood-risk information
Indicative flood depth
Flood ETA
Safer route selection
Public Transport
Identification of potentially affected roads
Dynamic route diversion
Improved operational planning
Social Impact
Supports safer evacuation
Reduces exposure to flood hazards
Improves preparedness and response
Economic Impact
Reduces disruption to transportation and businesses
Helps minimize infrastructure-related losses
Supports faster post-event response
Environmental Impact
Supports improved stormwater management
Encourages data-driven drainage planning
Contributes to urban climate resilience
Research Basis

The project methodology is informed by research in:

Urban flood nowcasting
Spatial-temporal graph learning
Radar rainfall nowcasting
Hybrid flood modelling
Smart drainage systems
Flood-aware transportation planning
Urban resilience

Selected references are listed below.

References

[1] H. Farahmand, Y. Xu, and A. Mostafavi, “A spatial–temporal graph deep learning model for urban flood nowcasting leveraging heterogeneous community features,” Scientific Reports, vol. 13, Art. no. 6768, 2023.

[2] J. Wan et al., “Generative machine learning for skilful 3D radar nowcasting,” npj Climate and Atmospheric Science, vol. 9, Art. no. 145, 2026.

[3] M. D. D. Perera, A. Angeloudis, A. Siripatana, et al., “Hybrid methods in flood inundation modeling: a systematic review,” Natural Hazards, vol. 122, Art. no. 357, 2026.

[4] A. Y. Nageye, A. D. Jimale, M. O. Abdullahi, et al., “Enhancing urban resilience: an IoT-based smart drainage system for flood management in Mogadishu, Somalia,” Discover Applied Sciences, vol. 7, Art. no. 515, 2025.

[5] X. He, M. Zhong, H. Yang, et al., “Assessing and optimizing flood recovery strategies for road network disruptions in Shenzhen based on isochrone analysis,” International Journal of Disaster Risk Science, 2026.

[6] X. Wu and P. Chen, “Coupling and decoupling of humans and the built environment under disaster disturbances,” Scientific Reports, vol. 15, Art. no. 40131, 2025.

Disclaimer

This repository contains a Smart India Hackathon prototype.

The current rainfall inputs, DEM, drainage-network parameters, flood thresholds, road network, and hydraulic parameters are representative or simulated for demonstration purposes.

The current surface flood model is a simplified DEM-informed spatial approximation, and the AI model is trained using synthetic physics-generated scenarios.

The system should not be used for operational flood warnings, emergency decisions, or public safety decisions without calibration and validation using authoritative real-world data.

A production deployment would require validated rainfall nowcasts, high-resolution GIS/DEM data, municipal drainage information, historical flood observations, hydraulic calibration, and appropriate operational safety procedures.

Vision

The long-term goal is to develop a real-time urban flood intelligence platform that can transform weather information into actionable information for cities.

Predict the Rain
       ↓
Understand the Drainage
       ↓
Model the Surface
       ↓
Predict the Flood
       ↓
Estimate When It Arrives
       ↓
Identify Unsafe Roads
       ↓
Recommend Safer Actions
From rainfall prediction to actionable street-level flood intelligence.
Smart India Hackathon 2026

Problem Statement: SIH26085
Theme: Disaster Management
Category: Software
Ministry: Ministry of Earth Sciences (MoES)


### One thing I would **not** add

Don't put a huge section saying **"100% accurate", "real-time radar integrated", "AI-powered GNN", "2D hydraulic simulation"**, etc. in the current README. Your actual prototype doesn't yet support those claims, and a judge can immediately test them.

Your strongest positioning is:

> **A working end-to-end prototype demonstrating the coupling of rainfall, surface runoff, drainage capacity, blockage, flood depth, ETA and flood-safe routing, with a clear pathway toward real radar/GIS/hydraulic deployment.**

That is both impressive **and defensible**.
