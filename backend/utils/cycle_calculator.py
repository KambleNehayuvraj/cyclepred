"""
CycleWise - Menstrual Cycle Calculator
Calculates cycle phases, next period, ovulation window, etc.
"""

from datetime import date, timedelta
from typing import Optional
from schemas.health_schema import CycleInfo


def calculate_bmi(weight_kg: float, height_cm: float) -> float:
    """Calculate Body Mass Index."""
    height_m = height_cm / 100
    return round(weight_kg / (height_m ** 2), 1)


def get_cycle_phase(cycle_day: int, cycle_length: int, period_duration: int) -> str:
    """
    Determine menstrual cycle phase based on cycle day.
    """
    ovulation_day = cycle_length - 14

    if cycle_day <= period_duration:
        return "menstrual"
    elif cycle_day < ovulation_day - 2:
        return "follicular"
    elif ovulation_day - 2 <= cycle_day <= ovulation_day + 2:
        return "ovulation"
    else:
        return "luteal"


def calculate_cycle_info(
    last_period_date: date,
    avg_cycle_length: int = 28,
    avg_period_duration: int = 5
) -> CycleInfo:

    today = date.today()

    days_since_last_period = (today - last_period_date).days
    current_cycle_day = (days_since_last_period % avg_cycle_length) + 1

    cycles_completed = days_since_last_period // avg_cycle_length
    next_period_date = last_period_date + timedelta(days=(cycles_completed + 1) * avg_cycle_length)
    days_until_next_period = (next_period_date - today).days

    ovulation_date = next_period_date - timedelta(days=14)
    ovulation_window_start = ovulation_date - timedelta(days=2)
    ovulation_window_end = ovulation_date + timedelta(days=2)

    is_fertile_window = ovulation_window_start <= today <= ovulation_window_end

    cycle_phase = get_cycle_phase(current_cycle_day, avg_cycle_length, avg_period_duration)

    return CycleInfo(
        current_cycle_day=current_cycle_day,
        cycle_phase=cycle_phase,
        next_period_date=next_period_date,
        ovulation_date=ovulation_date,
        ovulation_window_start=ovulation_window_start,
        ovulation_window_end=ovulation_window_end,
        days_until_next_period=days_until_next_period,
        is_fertile_window=is_fertile_window
    )


def get_phase_description(phase: str) -> dict:
    descriptions = {
        "menstrual": {
            "emoji": "🌑",
            "title": "Menstrual Phase",
            "description": "Your period is here.",
            "energy": "Low"
        },
        "follicular": {
            "emoji": "🌒",
            "title": "Follicular Phase",
            "description": "Energy increasing.",
            "energy": "Building"
        },
        "ovulation": {
            "emoji": "🌕",
            "title": "Ovulation Phase",
            "description": "Peak fertility.",
            "energy": "High"
        },
        "luteal": {
            "emoji": "🌖",
            "title": "Luteal Phase",
            "description": "Energy decreasing.",
            "energy": "Low"
        }
    }
    return descriptions.get(phase, descriptions["follicular"])