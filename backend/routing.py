import networkx as nx


def create_road_network():
    graph = nx.Graph()

    for node in ["A", "B", "C", "D", "E", "F"]:
        graph.add_node(node)

    graph.add_edge("A", "B", travel_time=5, flood_depth=0)
    graph.add_edge("A", "C", travel_time=4, flood_depth=0)
    graph.add_edge("B", "D", travel_time=4, flood_depth=0)
    graph.add_edge("C", "E", travel_time=4, flood_depth=0)
    graph.add_edge("D", "E", travel_time=3, flood_depth=0)
    graph.add_edge("D", "F", travel_time=5, flood_depth=0)
    graph.add_edge("E", "F", travel_time=4, flood_depth=0)

    return graph


# Position of each road node on the 8x8 flood grid.
ROAD_POSITIONS = {
    "A": (1, 1),
    "B": (2, 2),
    "C": (2, 4),
    "D": (4, 3),
    "E": (4, 5),
    "F": (6, 6),
}


def get_line_cells(start, end, rows=8, cols=8):
    """
    Approximate the cells crossed by a road segment.
    """

    r1, c1 = ROAD_POSITIONS[start]
    r2, c2 = ROAD_POSITIONS[end]

    steps = max(
        abs(r2 - r1),
        abs(c2 - c1),
        1
    )

    cells = []

    for i in range(steps + 1):

        t = i / steps

        row = round(r1 + (r2 - r1) * t)
        col = round(c1 + (c2 - c1) * t)

        row = max(0, min(rows - 1, row))
        col = max(0, min(cols - 1, col))

        if (row, col) not in cells:
            cells.append((row, col))

    return cells


def calculate_road_flood_depth(start, end, flood_grid):
    """
    Estimate maximum flood depth along a road segment.
    """

    cells = get_line_cells(start, end)

    depths = []

    for row, col in cells:

        if (
            row < len(flood_grid)
            and col < len(flood_grid[row])
        ):
            depths.append(
                flood_grid[row][col]
            )

    if not depths:
        return 0

    return round(max(depths), 2)


def classify_road(depth):
    if depth >= 30:
        return "BLOCKED"

    if depth >= 20:
        return "HIGH_RISK"

    if depth >= 10:
        return "CAUTION"

    return "SAFE"


def update_road_flooding(flood_grid):
    """
    Intersect the predicted flood grid with the road network.
    """

    graph = create_road_network()

    road_status = []

    for start, end, data in graph.edges(data=True):

        depth = calculate_road_flood_depth(
            start,
            end,
            flood_grid
        )

        status = classify_road(depth)

        data["flood_depth"] = depth
        data["status"] = status

        road_status.append({
            "from": start,
            "to": end,
            "flood_depth_cm": depth,
            "status": status
        })

    return graph, road_status


def calculate_route_cost(travel_time, flood_depth):

    if flood_depth >= 30:
        return float("inf")

    if flood_depth >= 20:
        return travel_time * 5

    if flood_depth >= 10:
        return travel_time * 2

    return travel_time


def find_safe_route(
    start,
    destination,
    flood_grid
):

    graph, road_status = update_road_flooding(
        flood_grid
    )

    for u, v, data in graph.edges(data=True):

        data["weight"] = calculate_route_cost(
            data["travel_time"],
            data["flood_depth"]
        )

    try:

        route = nx.shortest_path(
            graph,
            source=start,
            target=destination,
            weight="weight"
        )

        total_cost = nx.shortest_path_length(
            graph,
            source=start,
            target=destination,
            weight="weight"
        )

        return {
            "route": route,
            "cost": round(total_cost, 2),
            "roads": road_status
        }

    except nx.NetworkXNoPath:

        return {
            "route": [],
            "cost": None,
            "roads": road_status
        }