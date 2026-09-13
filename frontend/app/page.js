"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const MapComponent = dynamic(
  () => import("./MapComponent"),
  {
    ssr: false,
  }
);


function getRiskClass(risk) {
  switch (risk) {
    case "CRITICAL":
      return "bg-red-100 text-red-700";

    case "HIGH":
      return "bg-orange-100 text-orange-700";

    case "MODERATE":
      return "bg-yellow-100 text-yellow-700";

    default:
      return "bg-green-100 text-green-700";
  }
}


function getMaxDepth(nodes) {
  if (!nodes || nodes.length === 0) {
    return 0;
  }

  return Math.max(
    ...nodes.map(
      (node) => node.flood_depth_cm || 0
    )
  );
}


function getHighestRisk(nodes) {
  const priority = {
    LOW: 0,
    MODERATE: 1,
    HIGH: 2,
    CRITICAL: 3,
  };

  if (!nodes || nodes.length === 0) {
    return "LOW";
  }

  return nodes.reduce(
    (highest, node) => {
      const current = node.risk || "LOW";

      return priority[current] >
        priority[highest]
        ? current
        : highest;
    },
    "LOW"
  );
}


export default function Home() {

  const [rainfall, setRainfall] = useState(40);

  const [blockage, setBlockage] = useState(0);

  const [forecast, setForecast] = useState(60);

  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);

  const [route, setRoute] = useState(null);

  const [routing, setRouting] = useState(false);

  const [scenario, setScenario] = useState(null);

  const [scenarioLoading, setScenarioLoading] =
    useState(false);

  const [forecastData, setForecastData] =
    useState(null);

  const [forecastLoading, setForecastLoading] =
    useState(false);

  const [selectedTime, setSelectedTime] =
    useState(0);


  // --------------------------------------------------
  // FLOOD SIMULATION
  // --------------------------------------------------

  async function simulateFlood() {

    setLoading(true);

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/simulate",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            rainfall: rainfall,
            blockage: blockage,
            forecast_minutes: forecast,
          }),
        }
      );


      if (!response.ok) {
        throw new Error(
          "Simulation failed."
        );
      }


      const data = await response.json();

      setResult(data);

      setRoute(null);

      setScenario(null);

    } catch (error) {

      console.error(error);

      alert(
        "Could not run flood simulation."
      );

    } finally {

      setLoading(false);

    }
  }


  // --------------------------------------------------
  // 0–3 HOUR FORECAST
  // --------------------------------------------------

  async function generateForecast() {

    setForecastLoading(true);

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/forecast",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            rainfall: rainfall,
            blockage: blockage,
            forecast_minutes: 180,
          }),
        }
      );


      if (!response.ok) {
        throw new Error(
          "Forecast generation failed."
        );
      }


      const data = await response.json();

      setForecastData(data);

      setSelectedTime(0);

    } catch (error) {

      console.error(error);

      alert(
        "Could not generate flood forecast."
      );

    } finally {

      setForecastLoading(false);

    }
  }


  // --------------------------------------------------
  // FLOOD-SAFE ROUTE
  // --------------------------------------------------

  async function findSafeRoute() {

    if (!result) {

      alert(
        "Run a flood simulation first."
      );

      return;
    }


    setRouting(true);


    try {

      const response = await fetch(
        "http://127.0.0.1:8000/route",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({

            start: "A",

            destination: "F",

            flood_grid:
              result.flood_grid || [],

          }),
        }
      );


      if (!response.ok) {

        throw new Error(
          "Route calculation failed."
        );

      }


      const data =
        await response.json();


      setRoute(data);


    } catch (error) {

      console.error(error);

      alert(
        "Could not calculate safe route."
      );


    } finally {

      setRouting(false);

    }
  }


  // --------------------------------------------------
  // WHAT-IF SCENARIO
  // --------------------------------------------------

  async function runScenario() {

    setScenarioLoading(true);

    try {

      const scenarioRainfall =
        Math.min(
          rainfall + 20,
          120
        );

      const scenarioBlockage =
        Math.min(
          blockage + 20,
          100
        );


      const response = await fetch(
        "http://127.0.0.1:8000/simulate",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({

            rainfall:
              scenarioRainfall,

            blockage:
              scenarioBlockage,

            forecast_minutes:
              forecast,

          }),
        }
      );


      if (!response.ok) {

        throw new Error(
          "Scenario simulation failed."
        );

      }


      const data =
        await response.json();


      setScenario({

        ...data,

        rainfall:
          scenarioRainfall,

        blockage:
          scenarioBlockage,

      });


    } catch (error) {

      console.error(error);

      alert(
        "Could not run scenario."
      );


    } finally {

      setScenarioLoading(false);

    }
  }


  // --------------------------------------------------
  // CURRENT DISPLAY DATA
  // --------------------------------------------------

  const currentNodes =
    forecastData
      ? forecastData.forecast[
          selectedTime
        ].nodes
      : result?.nodes || [];


  const currentFloodGrid =
    forecastData
      ? forecastData.forecast[
          selectedTime
        ].flood_grid
      : result?.flood_grid || [];


  const currentMaxDepth =
    getMaxDepth(currentNodes);


  const currentRisk =
    getHighestRisk(currentNodes);


  const scenarioMaxDepth =
    scenario
      ? getMaxDepth(
          scenario.nodes
        )
      : 0;


  const scenarioRisk =
    scenario
      ? getHighestRisk(
          scenario.nodes
        )
      : "LOW";


  return (

    <main className="min-h-screen bg-gray-100">

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="bg-slate-900 text-white px-6 py-6">

        <div className="max-w-7xl mx-auto">

          <h1 className="text-3xl font-bold">

            Urban Flood Nowcasting System

          </h1>

          <p className="text-gray-300 mt-2">

            Real-time urban flood prediction,
            drainage analysis and flood-safe routing

          </p>

          <div className="flex flex-wrap gap-3 mt-4">

            <span className="px-3 py-1 rounded-full bg-blue-600 text-sm">

              SIH26085

            </span>

            <span className="px-3 py-1 rounded-full bg-gray-700 text-sm">

              0–3 Hour Forecast

            </span>

            <span className="px-3 py-1 rounded-full bg-gray-700 text-sm">

              Disaster Management

            </span>

          </div>

        </div>

      </header>


      <div className="max-w-7xl mx-auto px-6 py-8">


        {/* ==================================================
            CONTROL PANEL
        ================================================== */}

        <section className="bg-white p-6 rounded-xl shadow">

          <div className="flex flex-col lg:flex-row lg:items-end gap-6">


            {/* Rainfall */}

            <div className="flex-1">

              <label className="block font-semibold mb-2">

                Rainfall Intensity

              </label>

              <div className="flex items-center gap-4">

                <input
                  type="range"
                  min="20"
                  max="120"
                  step="5"
                  value={rainfall}
                  onChange={(e) =>
                    setRainfall(
                      Number(e.target.value)
                    )
                  }
                  className="w-full"
                />

                <span className="font-bold w-24">

                  {rainfall} mm/hr

                </span>

              </div>

            </div>


            {/* Blockage */}

            <div className="flex-1">

              <label className="block font-semibold mb-2">

                Drainage Blockage

              </label>

              <div className="flex items-center gap-4">

                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={blockage}
                  onChange={(e) =>
                    setBlockage(
                      Number(e.target.value)
                    )
                  }
                  className="w-full"
                />

                <span className="font-bold w-20">

                  {blockage}%

                </span>

              </div>

            </div>


            {/* Forecast */}

            <div className="flex-1">

              <label className="block font-semibold mb-2">

                Forecast Window

              </label>

              <select
                value={forecast}
                onChange={(e) =>
                  setForecast(
                    Number(e.target.value)
                  )
                }
                className="border rounded-lg px-4 py-2 w-full"
              >

                <option value={30}>
                  30 minutes
                </option>

                <option value={60}>
                  1 hour
                </option>

                <option value={120}>
                  2 hours
                </option>

                <option value={180}>
                  3 hours
                </option>

              </select>

            </div>

          </div>


          <div className="flex flex-wrap gap-3 mt-6">

            <button
              onClick={simulateFlood}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50"
            >

              {loading
                ? "Running Simulation..."
                : "Run Flood Simulation"}

            </button>


            <button
              onClick={generateForecast}
              disabled={forecastLoading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold disabled:opacity-50"
            >

              {forecastLoading
                ? "Generating Forecast..."
                : "Generate 0–3 Hour Forecast"}

            </button>


            <button
              onClick={runScenario}
              disabled={
                scenarioLoading
              }
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold disabled:opacity-50"
            >

              {scenarioLoading
                ? "Running Scenario..."
                : "Run What-If Scenario"}

            </button>

          </div>

        </section>


        {/* ==================================================
            SUMMARY CARDS
        ================================================== */}

        <section className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">


          <div className="bg-white p-5 rounded-xl shadow">

            <p className="text-gray-500 text-sm">
              Rainfall
            </p>

            <p className="text-2xl font-bold mt-1">
              {forecastData
                ? forecastData.forecast[
                    selectedTime
                  ].rainfall
                : rainfall}{" "}
              mm/hr
            </p>

          </div>


          <div className="bg-white p-5 rounded-xl shadow">

            <p className="text-gray-500 text-sm">
              Blockage
            </p>

            <p className="text-2xl font-bold mt-1">
              {blockage}%
            </p>

          </div>


          <div className="bg-white p-5 rounded-xl shadow">

            <p className="text-gray-500 text-sm">
              Forecast
            </p>

            <p className="text-2xl font-bold mt-1">
              0–3 hr
            </p>

          </div>


          <div className="bg-white p-5 rounded-xl shadow">

            <p className="text-gray-500 text-sm">
              Max Flood Depth
            </p>

            <p className="text-2xl font-bold mt-1">
              {currentMaxDepth} cm
            </p>

          </div>


          <div className="bg-white p-5 rounded-xl shadow">

            <p className="text-gray-500 text-sm">
              Highest Risk
            </p>

            <span
              className={`inline-block mt-2 px-3 py-1 rounded-full font-semibold ${getRiskClass(
                currentRisk
              )}`}
            >

              {currentRisk}

            </span>

          </div>

        </section>


        {/* ==================================================
            MAP
        ================================================== */}

        <section className="mt-8">

          <div className="bg-white p-4 rounded-xl shadow">

            <div className="mb-4">

              <h2 className="text-xl font-bold">
                Urban Flood Map
              </h2>

              <p className="text-gray-500 text-sm mt-1">

                Drainage network, predicted flood
                surface and road risk

              </p>

            </div>


            <div className="h-[600px] rounded-lg overflow-hidden">

              <MapComponent

                results={
                  currentNodes
                }

                route={route}

                roads={
                  route?.roads || []
                }

                floodGrid={
                  currentFloodGrid
                }

              />

            </div>


            {/* Road legend */}

            <div className="mt-4 flex flex-wrap gap-5 text-sm">

              <div className="flex items-center gap-2">

                <span className="w-4 h-4 rounded-full bg-green-600"></span>

                Safe

              </div>


              <div className="flex items-center gap-2">

                <span className="w-4 h-4 rounded-full bg-yellow-500"></span>

                Caution

              </div>


              <div className="flex items-center gap-2">

                <span className="w-4 h-4 rounded-full bg-orange-600"></span>

                High Risk

              </div>


              <div className="flex items-center gap-2">

                <span className="w-4 h-4 rounded-full bg-red-600"></span>

                Blocked

              </div>


              <div className="flex items-center gap-2">

                <span className="w-4 h-4 rounded-full bg-black"></span>

                Safe Route

              </div>

            </div>

          </div>

        </section>


        {/* ==================================================
            FORECAST TIMELINE
        ================================================== */}

        {forecastData && (

          <section className="mt-8 bg-white p-6 rounded-xl shadow">

            <div className="flex flex-col md:flex-row md:justify-between md:items-center">

              <div>

                <h2 className="text-xl font-bold">

                  0–3 Hour Flood Forecast

                </h2>

                <p className="text-gray-600 mt-1">

                  Forecast at{" "}

                  {
                    forecastData
                      .forecast[
                        selectedTime
                      ].time_min
                  }{" "}

                  minutes

                </p>

              </div>


              <div className="text-left md:text-right mt-4 md:mt-0">

                <p className="text-sm text-gray-500">

                  Forecast Rainfall

                </p>

                <p className="text-xl font-bold">

                  {
                    forecastData
                      .forecast[
                        selectedTime
                      ].rainfall
                  }{" "}

                  mm/hr

                </p>

              </div>

            </div>


            <input
              type="range"
              min="0"
              max={
                forecastData.forecast.length - 1
              }
              step="1"
              value={selectedTime}
              onChange={(e) =>
                setSelectedTime(
                  Number(e.target.value)
                )
              }
              className="w-full mt-6"
            />


            <div className="flex justify-between text-sm text-gray-500 mt-2">

              {forecastData.forecast.map(
                (step) => (

                  <span
                    key={
                      step.time_min
                    }
                  >

                    {step.time_min} min

                  </span>

                )
              )}

            </div>


            <div className="mt-6 p-4 bg-gray-50 rounded-lg">

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                <div>

                  <p className="text-sm text-gray-500">
                    Current Time
                  </p>

                  <p className="font-bold">
                    {
                      forecastData
                        .forecast[
                          selectedTime
                        ].time_min
                    }{" "}
                    min
                  </p>

                </div>


                <div>

                  <p className="text-sm text-gray-500">
                    Rainfall
                  </p>

                  <p className="font-bold">
                    {
                      forecastData
                        .forecast[
                          selectedTime
                        ].rainfall
                    }{" "}
                    mm/hr
                  </p>

                </div>


                <div>

                  <p className="text-sm text-gray-500">
                    Maximum Depth
                  </p>

                  <p className="font-bold">
                    {
                      getMaxDepth(
                        forecastData
                          .forecast[
                            selectedTime
                          ].nodes
                      )
                    }{" "}
                    cm
                  </p>

                </div>


                <div>

                  <p className="text-sm text-gray-500">
                    Highest Risk
                  </p>

                  <p className="font-bold">
                    {
                      getHighestRisk(
                        forecastData
                          .forecast[
                            selectedTime
                          ].nodes
                      )
                    }
                  </p>

                </div>

              </div>

            </div>

          </section>

        )}


        {/* ==================================================
            DRAINAGE STATUS
        ================================================== */}

        {currentNodes.length > 0 && (

          <section className="mt-8 bg-white p-6 rounded-xl shadow">

            <h2 className="text-xl font-bold">

              Drainage Network Status

            </h2>

            <p className="text-gray-500 mt-1">

              Hydraulic capacity and predicted
              surcharge at each drainage node

            </p>


            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">

              {currentNodes.map(
                (node) => {

                  const utilization =
                    node.capacity > 0
                      ? Math.round(
                          (node.runoff /
                            node.capacity) *
                            100
                        )
                      : 0;


                  return (

                    <div
                      key={node.node}
                      className="border rounded-xl p-5"
                    >

                      <div className="flex justify-between items-center">

                        <h3 className="font-bold text-lg">

                          {node.node}

                        </h3>


                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${getRiskClass(
                            node.risk
                          )}`}
                        >

                          {node.risk}

                        </span>

                      </div>


                      <div className="mt-4 space-y-2 text-sm">

                        <p>
                          Runoff:{" "}
                          <strong>
                            {node.runoff} m³/s
                          </strong>
                        </p>


                        <p>
                          Effective Capacity:{" "}
                          <strong>
                            {node.capacity} m³/s
                          </strong>
                        </p>


                        <p>
                          Capacity Utilization:{" "}
                          <strong>
                            {utilization}%
                          </strong>
                        </p>


                        <p>
                          Surcharge:{" "}
                          <strong>
                            {node.surcharge} m³/s
                          </strong>
                        </p>


                        <p>
                          Flood Depth:{" "}
                          <strong>
                            {node.flood_depth_cm} cm
                          </strong>
                        </p>


                        <p>
                          Flood ETA:{" "}
                          <strong>
                            {node.flood_eta_min
                              ? `${node.flood_eta_min} min`
                              : "No flooding"}
                          </strong>
                        </p>

                      </div>

                    </div>

                  );

                }
              )}

            </div>

          </section>

        )}


        {/* ==================================================
            FLOOD ETA
        ================================================== */}

        {result && (

          <section className="mt-8 bg-white p-6 rounded-xl shadow">

            <h2 className="text-xl font-bold">

              Flood ETA

            </h2>

            <p className="text-gray-500 mt-1">

              Estimated time until flood conditions
              develop at drainage locations

            </p>


            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">

              {result.nodes.map(
                (node) => (

                  <div
                    key={node.node}
                    className="border rounded-xl p-5"
                  >

                    <div className="flex justify-between">

                      <h3 className="font-semibold">

                        Node {node.node}

                      </h3>


                      <span
                        className={`px-2 py-1 rounded text-sm ${getRiskClass(
                          node.risk
                        )}`}
                      >

                        {node.risk}

                      </span>

                    </div>


                    <p className="mt-4">

                      Flood Depth:{" "}

                      <strong>
                        {node.flood_depth_cm} cm
                      </strong>

                    </p>


                    <p className="mt-2">

                      Estimated ETA:{" "}

                      <strong>

                        {node.flood_eta_min
                          ? `${node.flood_eta_min} min`
                          : "No flooding"}

                      </strong>

                    </p>

                  </div>

                )
              )}

            </div>

          </section>

        )}


        {/* ==================================================
            SAFE ROUTING
        ================================================== */}

        <section className="mt-8 bg-white p-6 rounded-xl shadow">

          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">

            <div>

              <h2 className="text-xl font-bold">

                Flood-Safe Routing

              </h2>

              <p className="text-gray-500 mt-1">

                Find the safest available route
                under predicted flood conditions

              </p>

            </div>


            <button
              onClick={findSafeRoute}
              disabled={
                routing || !result
              }
              className="px-6 py-3 bg-black text-white rounded-lg font-semibold disabled:opacity-50"
            >

              {routing
                ? "Calculating Route..."
                : "Find Safe Route"}

            </button>

          </div>


          {route && (

            <div className="mt-6 p-5 border rounded-xl">

              <h3 className="font-bold text-lg">

                Recommended Route

              </h3>


              {route.route?.length > 0 ? (

                <>

                  <p className="mt-3 text-2xl font-bold">

                    {route.route.join(
                      " → "
                    )}

                  </p>


                  <p className="mt-3 text-gray-600">

                    Route cost:{" "}

                    <strong>
                      {route.cost}
                    </strong>

                  </p>

                </>

              ) : (

                <p className="mt-3 text-red-600 font-semibold">

                  No safe route available
                  under the current flood
                  conditions.

                </p>

              )}


              {route.roads &&
                route.roads.length > 0 && (

                  <div className="mt-6">

                    <h4 className="font-semibold">

                      Road Risk Assessment

                    </h4>


                    <div className="mt-3 space-y-2">

                      {route.roads.map(
                        (road) => (

                          <div
                            key={`${road.from}-${road.to}`}
                            className="flex flex-col md:flex-row md:justify-between md:items-center border rounded-lg p-3"
                          >

                            <span>

                              {road.from}
                              {" → "}
                              {road.to}

                            </span>


                            <span className="text-sm">

                              {road.flood_depth_cm} cm


                              {" — "}


                              <strong>

                                {road.status.replace(
                                  "_",
                                  " "
                                )}

                              </strong>

                            </span>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                )}

            </div>

          )}

        </section>


        {/* ==================================================
            WHAT-IF SCENARIO
        ================================================== */}

        {scenario && (

          <section className="mt-8 bg-white p-6 rounded-xl shadow">

            <h2 className="text-xl font-bold">

              What-If Scenario

            </h2>

            <p className="text-gray-500 mt-1">

              Impact of increased rainfall and
              drainage blockage

            </p>


            <div className="grid md:grid-cols-2 gap-6 mt-6">


              {/* Current */}

              <div className="border rounded-xl p-5">

                <h3 className="font-bold">

                  Current Scenario

                </h3>


                <div className="mt-4 space-y-2">

                  <p>
                    Rainfall:{" "}
                    <strong>
                      {rainfall} mm/hr
                    </strong>
                  </p>

                  <p>
                    Blockage:{" "}
                    <strong>
                      {blockage}%
                    </strong>
                  </p>

                  <p>
                    Maximum Depth:{" "}
                    <strong>
                      {currentMaxDepth} cm
                    </strong>
                  </p>

                  <p>
                    Highest Risk:{" "}
                    <strong>
                      {currentRisk}
                    </strong>
                  </p>

                </div>

              </div>


              {/* Scenario */}

              <div className="border rounded-xl p-5">

                <h3 className="font-bold">

                  Stress Scenario

                </h3>


                <div className="mt-4 space-y-2">

                  <p>
                    Rainfall:{" "}
                    <strong>
                      {scenario.rainfall} mm/hr
                    </strong>
                  </p>

                  <p>
                    Blockage:{" "}
                    <strong>
                      {scenario.blockage}%
                    </strong>
                  </p>

                  <p>
                    Maximum Depth:{" "}
                    <strong>
                      {scenarioMaxDepth} cm
                    </strong>
                  </p>

                  <p>
                    Highest Risk:{" "}
                    <strong>
                      {scenarioRisk}
                    </strong>
                  </p>

                </div>

              </div>

            </div>


            <div className="mt-6">

              <h3 className="font-semibold">

                Scenario Node Analysis

              </h3>


              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">

                {scenario.nodes.map(
                  (node) => (

                    <div
                      key={node.node}
                      className="border rounded-lg p-4"
                    >

                      <div className="flex justify-between">

                        <strong>
                          {node.node}
                        </strong>

                        <span
                          className={`px-2 py-1 rounded text-xs ${getRiskClass(
                            node.risk
                          )}`}
                        >

                          {node.risk}

                        </span>

                      </div>


                      <p className="mt-3 text-sm">

                        Flood Depth:{" "}

                        {node.flood_depth_cm} cm

                      </p>


                      <p className="text-sm">

                        Capacity Utilization:{" "}

                        {node.capacity > 0
                          ? Math.round(
                              (node.runoff /
                                node.capacity) *
                                100
                            )
                          : 0}%

                      </p>

                    </div>

                  )
                )}

              </div>

            </div>

          </section>

        )}


        {/* ==================================================
            FLOOD ALERTS
        ================================================== */}

        {currentNodes.length > 0 && (

          <section className="mt-8 bg-white p-6 rounded-xl shadow">

            <h2 className="text-xl font-bold">

              Flood Alerts

            </h2>


            <p className="text-gray-500 mt-1">

              Locations requiring attention under
              the current forecast

            </p>


            <div className="mt-5">

              {currentNodes.filter(
                (node) =>
                  node.risk === "HIGH" ||
                  node.risk === "CRITICAL"
              ).length === 0 ? (

                <div className="p-4 rounded-lg bg-green-50 border border-green-200">

                  <p className="text-green-700 font-semibold">

                    No high-risk flood alerts
                    under the current scenario.

                  </p>

                </div>

              ) : (

                currentNodes
                  .filter(
                    (node) =>
                      node.risk === "HIGH" ||
                      node.risk === "CRITICAL"
                  )
                  .map(
                    (node) => (

                      <div
                        key={node.node}
                        className="mt-3 p-4 rounded-lg bg-red-50 border border-red-200"
                      >

                        <p className="font-semibold text-red-700">

                          Flood Risk Alert —{" "}
                          {node.node}

                        </p>


                        <p className="text-sm mt-1">

                          Predicted depth:{" "}

                          {node.flood_depth_cm} cm

                        </p>


                        <p className="text-sm">

                          Estimated onset:{" "}

                          {node.flood_eta_min
                            ? `${node.flood_eta_min} minutes`
                            : "N/A"}

                        </p>


                        <p className="text-sm">

                          Capacity utilization:{" "}

                          {node.capacity > 0
                            ? Math.round(
                                (node.runoff /
                                  node.capacity) *
                                  100
                              )
                            : 0}%

                        </p>

                      </div>

                    )
                  )

              )}

            </div>

          </section>

        )}


        {/* ==================================================
            SYSTEM STATUS
        ================================================== */}

        <section className="mt-8 mb-10 bg-slate-900 text-white p-6 rounded-xl">

          <h2 className="text-xl font-bold">

            System Status

          </h2>


          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-5">

            <div>

              <p className="text-gray-400 text-sm">
                Rainfall Engine
              </p>

              <p className="text-green-400 font-semibold">
                Ready
              </p>

            </div>


            <div>

              <p className="text-gray-400 text-sm">
                Drainage Model
              </p>

              <p className="text-green-400 font-semibold">
                Ready
              </p>

            </div>


            <div>

              <p className="text-gray-400 text-sm">
                Surface Model
              </p>

              <p className="text-green-400 font-semibold">
                Ready
              </p>

            </div>


            <div>

              <p className="text-gray-400 text-sm">
                Forecast Engine
              </p>

              <p className="text-green-400 font-semibold">
                Ready
              </p>

            </div>


            <div>

              <p className="text-gray-400 text-sm">
                Routing Engine
              </p>

              <p className="text-green-400 font-semibold">
                Ready
              </p>

            </div>

          </div>


          <p className="text-gray-400 text-sm mt-6">

            Prototype note: rainfall trajectories,
            DEM and drainage parameters currently use
            representative/simulated inputs. The
            deployment architecture is designed to
            accept high-resolution radar and GIS data.

          </p>

        </section>

      </div>

    </main>

  );
}