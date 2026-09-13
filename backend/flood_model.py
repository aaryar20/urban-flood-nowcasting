def calculate_runoff(
    rainfall_mm_hr,
    area_m2,
    runoff_coefficient=0.8
):
    """
    Convert rainfall intensity into runoff flow rate.

    rainfall: mm/hr
    area: m²

    Returns:
        runoff flow rate in m³/s
    """

    rainfall_m_s = rainfall_mm_hr / 1000 / 3600

    runoff_flow = (
        rainfall_m_s
        * area_m2
        * runoff_coefficient
    )

    return runoff_flow


def effective_capacity(capacity, blockage_percent):
    """
    Reduce drainage capacity according to blockage.
    """

    return capacity * (
        1 - blockage_percent / 100
    )


def calculate_surcharge(inflow, capacity):
    """
    Amount of flow exceeding drainage capacity.
    """

    return max(
        0,
        inflow - capacity
    )


def flood_risk(inflow, capacity):

    if capacity <= 0:
        return "CRITICAL"

    ratio = inflow / capacity

    if ratio <= 0.8:
        return "LOW"

    elif ratio <= 1.0:
        return "MODERATE"

    elif ratio <= 1.2:
        return "HIGH"

    else:
        return "CRITICAL"


def calculate_flood_depth(
    surcharge,
    area_m2
):
    """
    Prototype flood-depth estimation.

    This is a demonstration model and
    should not be interpreted as calibrated
    real-world hydraulic depth.
    """

    if surcharge <= 0:
        return 0

    # Convert excess flow into a
    # representative surface-water volume
    accumulation_time = 300  # 5 minutes

    excess_volume = (
        surcharge
        * accumulation_time
    )

    # Assume water spreads across
    # approximately 20% of catchment area
    surface_area = max(
        area_m2 * 0.2,
        1
    )

    depth_m = (
        excess_volume
        / surface_area
    )

    depth_cm = depth_m * 100

    return round(
        min(depth_cm, 100),
        2
    )


def calculate_flood_eta(
    flood_depth_cm,
    rainfall_mm_hr
):
    """
    Estimate time until noticeable
    surface flooding.

    Prototype/demo approximation.
    """

    if flood_depth_cm <= 0:
        return None

    rainfall_factor = max(
        rainfall_mm_hr,
        1
    )

    eta = (
        60
        / rainfall_factor
        * 100
    )

    eta = max(
        5,
        min(eta, 180)
    )

    return round(eta)