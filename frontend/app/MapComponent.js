"use client";

import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Rectangle,
  Popup,
  useMap
} from "react-leaflet";

import "leaflet/dist/leaflet.css";


// ======================================================
// MAP CONFIGURATION
// ======================================================

const mapCenter = [
  19.0775,
  72.8840
];


// ======================================================
// DRAINAGE NODE LOCATIONS
// ======================================================

const drainageNodes = {

  N1: [19.0760, 72.8777],

  N2: [19.0785, 72.8810],

  N3: [19.0810, 72.8840],

  N4: [19.0750, 72.8850],

  N5: [19.0790, 72.8890]

};


// ======================================================
// DRAINAGE CONNECTIONS
// ======================================================

const drainageConnections = [

  ["N1", "N2"],

  ["N2", "N3"],

  ["N2", "N4"],

  ["N3", "N5"],

  ["N4", "N5"]

];


// ======================================================
// ROAD NETWORK
// ======================================================

const roadNodes = {

  A: [19.0740, 72.8760],

  B: [19.0770, 72.8790],

  C: [19.0735, 72.8820],

  D: [19.0790, 72.8820],

  E: [19.0770, 72.8870],

  F: [19.0810, 72.8900]

};


// ======================================================
// FLOOD RISK COLORS
// ======================================================

function getRiskColor(risk) {

  switch (risk) {

    case "CRITICAL":
      return "#dc2626";

    case "HIGH":
      return "#ea580c";

    case "MODERATE":
      return "#eab308";

    default:
      return "#16a34a";
  }
}


function getRiskFill(risk) {

  switch (risk) {

    case "CRITICAL":
      return "#ef4444";

    case "HIGH":
      return "#f97316";

    case "MODERATE":
      return "#facc15";

    default:
      return "#22c55e";
  }
}


// ======================================================
// ROAD RISK COLORS
// ======================================================

function getRoadColor(status) {

  switch (status) {

    case "BLOCKED":
      return "#dc2626";

    case "HIGH_RISK":
      return "#ea580c";

    case "CAUTION":
      return "#eab308";

    default:
      return "#16a34a";
  }
}


// ======================================================
// ROAD STATUS LABEL
// ======================================================

function getRoadLabel(status) {

  switch (status) {

    case "BLOCKED":
      return "BLOCKED";

    case "HIGH_RISK":
      return "HIGH RISK";

    case "CAUTION":
      return "CAUTION";

    default:
      return "SAFE";
  }
}


// ======================================================
// FLOOD GRID COLOR
// ======================================================

function getFloodColor(depth) {

  if (depth >= 30) {
    return "#dc2626";
  }

  if (depth >= 20) {
    return "#f97316";
  }

  if (depth >= 10) {
    return "#eab308";
  }

  if (depth > 0) {
    return "#60a5fa";
  }

  return "transparent";
}


// ======================================================
// FLOOD GRID OPACITY
// ======================================================

function getFloodOpacity(depth) {

  if (depth <= 0) {
    return 0;
  }

  if (depth >= 30) {
    return 0.65;
  }

  if (depth >= 20) {
    return 0.55;
  }

  if (depth >= 10) {
    return 0.45;
  }

  return 0.30;
}


// ======================================================
// FIT MAP TO DATA
// ======================================================

function MapResize() {

  const map = useMap();

  setTimeout(() => {

    map.invalidateSize();

  }, 100);

  return null;
}


// ======================================================
// MAIN COMPONENT
// ======================================================

export default function MapComponent({

  results = [],

  route = null,

  roads = [],

  floodGrid = []

}) {


  // ====================================================
  // FIND NODE RESULT
  // ====================================================

  function getNodeResult(nodeId) {

    return results.find(
      (node) => node.node === nodeId
    );

  }


  // ====================================================
  // RENDER
  // ====================================================

  return (

    <MapContainer

      center={mapCenter}

      zoom={15}

      scrollWheelZoom={true}

      style={{
        height: "100%",
        width: "100%"
      }}

    >

      <MapResize />


      {/* ==================================================
          BASE MAP
      ================================================== */}

      <TileLayer

        attribution='&copy; OpenStreetMap contributors'

        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

      />


      {/* ==================================================
          FLOOD GRID
      ================================================== */}

      {floodGrid &&
        floodGrid.length > 0 &&

        floodGrid.map(
          (row, rowIndex) =>

            row.map(
              (depth, colIndex) => {

                if (!depth || depth <= 0) {
                  return null;
                }


                /*
                 * The current prototype uses an 8x8
                 * representative grid.
                 *
                 * These coordinates are mapped over
                 * the demonstration area.
                 */

                const baseLat =
                  19.0715;

                const baseLng =
                  72.8720;

                const cellSize =
                  0.00135;


                const southWest = [

                  baseLat +
                    rowIndex *
                    cellSize,

                  baseLng +
                    colIndex *
                    cellSize

                ];


                const northEast = [

                  baseLat +
                    (rowIndex + 1) *
                    cellSize,

                  baseLng +
                    (colIndex + 1) *
                    cellSize

                ];


                return (

                  <Rectangle

                    key={`flood-${rowIndex}-${colIndex}`}

                    bounds={[
                      southWest,
                      northEast
                    ]}

                    pathOptions={{

                      color:
                        getFloodColor(
                          depth
                        ),

                      fillColor:
                        getFloodColor(
                          depth
                        ),

                      fillOpacity:
                        getFloodOpacity(
                          depth
                        ),

                      weight: 0.5

                    }}

                  >

                    <Popup>

                      <strong>
                        Predicted Flood Cell
                      </strong>

                      <br />

                      Depth:{" "}

                      {depth} cm

                    </Popup>

                  </Rectangle>

                );

              }

            )

        )
      }


      {/* ==================================================
          DRAINAGE NETWORK
      ================================================== */}

      {drainageConnections.map(
        ([start, end]) => {

          const startPosition =
            drainageNodes[start];

          const endPosition =
            drainageNodes[end];


          if (
            !startPosition ||
            !endPosition
          ) {

            return null;

          }


          return (

            <Polyline

              key={`drainage-${start}-${end}`}

              positions={[
                startPosition,
                endPosition
              ]}

              pathOptions={{
                color: "#2563eb",
                weight: 3,
                opacity: 0.8,
                dashArray: "6 4"
              }}

            >

              <Popup>

                <strong>
                  Drainage Connection
                </strong>

                <br />

                {start} → {end}

              </Popup>

            </Polyline>

          );

        }

      )}


      {/* ==================================================
          DRAINAGE NODES
      ================================================== */}

      {Object.entries(
        drainageNodes
      ).map(
        ([nodeId, position]) => {

          const node =
            getNodeResult(nodeId);

          const risk =
            node?.risk || "LOW";


          return (

            <CircleMarker

              key={`node-${nodeId}`}

              center={position}

              radius={10}

              pathOptions={{

                color:
                  getRiskColor(risk),

                fillColor:
                  getRiskFill(risk),

                fillOpacity: 0.9,

                weight: 3

              }}

            >

              <Popup>

                <div
                  style={{
                    minWidth: "180px"
                  }}
                >

                  <strong>
                    Drainage Node {nodeId}
                  </strong>


                  <hr
                    style={{
                      margin:
                        "6px 0"
                    }}
                  />


                  <div>

                    Risk:{" "}

                    <strong>
                      {risk}
                    </strong>

                  </div>


                  {node && (

                    <>

                      <div>
                        Runoff:{" "}
                        {node.runoff} m³/s
                      </div>


                      <div>
                        Capacity:{" "}
                        {node.capacity} m³/s
                      </div>


                      <div>
                        Surcharge:{" "}
                        {node.surcharge} m³/s
                      </div>


                      <div>
                        Flood Depth:{" "}
                        {node.flood_depth_cm} cm
                      </div>


                      <div>
                        Flood ETA:{" "}

                        {node.flood_eta_min
                          ? `${node.flood_eta_min} min`
                          : "No flooding"}

                      </div>


                      <div>

                        Capacity Utilization:{" "}

                        {node.capacity > 0
                          ? Math.round(
                              (
                                node.runoff /
                                node.capacity
                              ) *
                              100
                            )
                          : 0}%

                      </div>

                    </>

                  )}

                </div>

              </Popup>

            </CircleMarker>

          );

        }

      )}


      {/* ==================================================
          ROAD NETWORK
      ================================================== */}

      {roads &&
        roads.length > 0 &&

        roads.map(
          (road) => {

            const start =
              roadNodes[
                road.from
              ];

            const end =
              roadNodes[
                road.to
              ];


            if (
              !start ||
              !end
            ) {

              return null;

            }


            const roadColor =
              getRoadColor(
                road.status
              );


            return (

              <Polyline

                key={`road-${road.from}-${road.to}`}

                positions={[
                  start,
                  end
                ]}

                pathOptions={{

                  color:
                    roadColor,

                  weight:
                    road.status ===
                    "BLOCKED"
                      ? 7
                      : 5,

                  opacity: 0.95

                }}

              >

                <Popup>

                  <strong>

                    Road {road.from}
                    {" → "}
                    {road.to}

                  </strong>


                  <hr
                    style={{
                      margin:
                        "6px 0"
                    }}
                  />


                  <div>

                    Flood Depth:{" "}

                    <strong>
                      {
                        road.flood_depth_cm
                      } cm
                    </strong>

                  </div>


                  <div>

                    Status:{" "}

                    <strong>

                      {
                        getRoadLabel(
                          road.status
                        )
                      }

                    </strong>

                  </div>

                </Popup>

              </Polyline>

            );

          }

        )
      }


      {/* ==================================================
          FALLBACK ROAD NETWORK
          Used before route analysis has run.
      ================================================== */}

      {(!roads ||
        roads.length === 0) &&

        [

          ["A", "B"],
          ["A", "C"],
          ["B", "D"],
          ["C", "E"],
          ["D", "E"],
          ["D", "F"],
          ["E", "F"]

        ].map(
          ([start, end]) => {

            const startPosition =
              roadNodes[start];

            const endPosition =
              roadNodes[end];


            return (

              <Polyline

                key={`fallback-${start}-${end}`}

                positions={[
                  startPosition,
                  endPosition
                ]}

                pathOptions={{

                  color: "#6b7280",

                  weight: 4,

                  opacity: 0.7

                }}

              >

                <Popup>

                  <strong>
                    Road Segment
                  </strong>

                  <br />

                  {start} → {end}

                  <br />

                  Run flood simulation
                  and route analysis to
                  calculate flood risk.

                </Popup>

              </Polyline>

            );

          }

        )
      }


      {/* ==================================================
          ROUTE
      ================================================== */}

      {route &&
        route.route &&
        route.route.length > 1 &&

        (

          <Polyline

            positions={route.route
              .map(
                (node) =>
                  roadNodes[node]
              )
              .filter(Boolean)
            }

            pathOptions={{

              color: "#000000",

              weight: 9,

              opacity: 1

            }}

          >

            <Popup>

              <strong>
                Flood-Safe Route
              </strong>

              <br />

              {route.route.join(
                " → "
              )}

              <br />

              Route Cost:{" "}

              {route.cost}

            </Popup>

          </Polyline>

        )
      }


      {/* ==================================================
          ROUTE NODES
      ================================================== */}

      {route &&
        route.route &&

        route.route.map(
          (node) => {

            const position =
              roadNodes[node];


            if (!position) {
              return null;
            }


            return (

              <CircleMarker

                key={`route-node-${node}`}

                center={position}

                radius={7}

                pathOptions={{

                  color: "#000000",

                  fillColor:
                    "#ffffff",

                  fillOpacity: 1,

                  weight: 3

                }}

              >

                <Popup>

                  <strong>
                    Route Node {node}
                  </strong>

                </Popup>

              </CircleMarker>

            );

          }

        )
      }


      {/* ==================================================
          DRAINAGE NODE LABELS
      ================================================== */}

      {Object.entries(
        drainageNodes
      ).map(
        ([nodeId, position]) => {

          return (

            <CircleMarker

              key={`label-${nodeId}`}

              center={[
                position[0] + 0.00015,
                position[1]
              ]}

              radius={3}

              pathOptions={{

                color: "transparent",

                fillColor:
                  "transparent",

                fillOpacity: 0

              }}

            >

              <Popup>

                Drainage Node{" "}
                <strong>
                  {nodeId}
                </strong>

              </Popup>

            </CircleMarker>

          );

        }

      )}


    </MapContainer>

  );

}