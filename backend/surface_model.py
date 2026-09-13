import math


# Prototype DEM for the demonstration zone.
# Lower values represent lower-lying areas where water
# is more likely to accumulate.
DEM = [
    [12, 12, 11, 10, 9, 9, 10, 11],
    [12, 11, 10, 9, 8, 8, 9, 10],
    [11, 10, 9, 8, 7, 7, 8, 9],
    [10, 9, 8, 7, 6, 6, 7, 8],
    [10, 9, 8, 7, 5, 5, 6, 8],
    [11, 10, 9, 8, 6, 6, 7, 9],
    [12, 11, 10, 9, 7, 7, 8, 10],
    [13, 12, 11, 10, 8, 8, 9, 11],
]


NODE_POSITIONS = {
    "N1": (2, 1),
    "N2": (3, 3),
    "N3": (5, 4),
    "N4": (3, 5),
    "N5": (5, 6),
}


def generate_flood_grid(results):
    """
    Prototype DEM-informed flood surface.

    The model distributes predicted excess water around
    drainage nodes while giving greater accumulation to
    lower-elevation cells.

    This is NOT a calibrated 2D hydraulic solver.
    It is an MVP surface-flooding approximation that will
    later be replaced by a real DEM-based hydraulic model.
    """

    rows = len(DEM)
    cols = len(DEM[0])

    grid = [
        [0.0 for _ in range(cols)]
        for _ in range(rows)
    ]

    min_elevation = min(
        min(row)
        for row in DEM
    )

    max_elevation = max(
        max(row)
        for row in DEM
    )

    elevation_range = max_elevation - min_elevation

    for node in results:

        node_id = node["node"]

        flood_depth = node.get(
            "flood_depth_cm",
            0
        )

        if flood_depth <= 0:
            continue

        if node_id not in NODE_POSITIONS:
            continue

        center_row, center_col = NODE_POSITIONS[node_id]

        # Larger flooding produces a larger affected area.
        spread = 1.5 + min(
            flood_depth / 30,
            2.5
        )

        for row in range(rows):

            for col in range(cols):

                distance = math.sqrt(
                    (row - center_row) ** 2
                    +
                    (col - center_col) ** 2
                )

                if distance > spread:
                    continue

                # Spatial influence of the failed drainage node.
                spatial_factor = max(
                    0,
                    1 - distance / spread
                )

                # Lower elevations receive a larger accumulation factor.
                elevation_factor = (
                    (max_elevation - DEM[row][col])
                    / elevation_range
                )

                elevation_factor = (
                    0.5
                    +
                    0.5 * elevation_factor
                )

                cell_depth = (
                    flood_depth
                    * spatial_factor
                    * elevation_factor
                )

                grid[row][col] = round(
                    max(
                        grid[row][col],
                        cell_depth
                    ),
                    2
                )

    return grid


def get_dem():
    """
    Return the prototype elevation grid.
    """
    return DEM