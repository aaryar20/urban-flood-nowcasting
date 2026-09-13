import networkx as nx


def create_drainage_network():

    graph = nx.DiGraph()

    graph.add_node(
        "N1",
        capacity=0.18,
        area=10000
    )

    graph.add_node(
        "N2",
        capacity=0.16,
        area=8000
    )

    graph.add_node(
        "N3",
        capacity=0.10,
        area=6000
    )

    graph.add_node(
        "N4",
        capacity=0.15,
        area=9000
    )

    graph.add_node(
        "N5",
        capacity=0.12,
        area=7000
    )

    graph.add_edge("N1", "N2")
    graph.add_edge("N2", "N3")
    graph.add_edge("N2", "N4")
    graph.add_edge("N3", "N5")
    graph.add_edge("N4", "N5")

    return graph