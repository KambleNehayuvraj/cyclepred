from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from bson import ObjectId

from database import get_users_collection, get_health_data_collection
from schemas.health_schema import HealthOnboarding, HealthDataResponse
from utils.auth import get_current_user
from utils.cycle_calculator import calculate_cycle_info, calculate_bmi, get_phase_description

router = APIRouter(prefix="/user", tags=["User"])


@router.post("/onboarding", status_code=status.HTTP_201_CREATED)
async def submit_onboarding(data: HealthOnboarding, current_user: dict = Depends(get_current_user)):
    """Submit the 21-question health onboarding form."""
    users_col = get_users_collection()
    health_col = get_health_data_collection()
    user_id = str(current_user["_id"])

    # Auto-calculate BMI if not provided
    bmi = data.bmi or calculate_bmi(data.weight_kg, data.height_cm)

    # Build health document
    health_dict = data.model_dump()
    health_dict["bmi"] = bmi
    health_dict["last_period_date"] = str(data.last_period_date)

    # Calculate cycle info
    cycle_info = calculate_cycle_info(
        data.last_period_date,
        data.avg_cycle_length,
        data.avg_period_duration
    )

    health_doc = {
        "user_id": user_id,
        "onboarding_data": health_dict,
        "cycle_info": cycle_info.model_dump(mode="json"),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    # Upsert: replace if already exists for this user
    existing = await health_col.find_one({"user_id": user_id})
    if existing:
        await health_col.update_one(
            {"user_id": user_id},
            {"$set": {**health_doc, "updated_at": datetime.utcnow()}}
        )
        health_id = str(existing["_id"])
    else:
        result = await health_col.insert_one(health_doc)
        health_id = str(result.inserted_id)

    # Mark onboarding complete on user record
    await users_col.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"onboarding_completed": True, "updated_at": datetime.utcnow()}}
    )

    return {
        "message": "Onboarding data saved successfully!",
        "health_data_id": health_id,
        "bmi": bmi,
        "cycle_info": cycle_info.model_dump(mode="json"),
        "phase_info": get_phase_description(cycle_info.cycle_phase)
    }


@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get current user profile with health data and cycle info."""
    health_col = get_health_data_collection()
    user_id = str(current_user["_id"])

    health_data = await health_col.find_one({"user_id": user_id})

    profile = {
        "id": user_id,
        "name": current_user["name"],
        "email": current_user["email"],
        "onboarding_completed": current_user.get("onboarding_completed", False),
        "created_at": current_user["created_at"].isoformat(),
    }

    if health_data:
        onboarding = health_data.get("onboarding_data", {})

        # Recalculate fresh cycle info
        from datetime import date
        last_period_str = onboarding.get("last_period_date")
        if last_period_str:
            last_period = date.fromisoformat(last_period_str)
            fresh_cycle = calculate_cycle_info(
                last_period,
                onboarding.get("avg_cycle_length", 28),
                onboarding.get("avg_period_duration", 5)
            )
            cycle_info = fresh_cycle.model_dump(mode="json")
            phase_info = get_phase_description(fresh_cycle.cycle_phase)
        else:
            cycle_info = health_data.get("cycle_info")
            phase_info = None

        profile["health_data"] = {
            "age": onboarding.get("age"),
            "bmi": onboarding.get("bmi"),
            "cycle_regularity": onboarding.get("cycle_regularity"),
            "avg_cycle_length": onboarding.get("avg_cycle_length"),
            "last_period_date": onboarding.get("last_period_date"),
            "diet_type": onboarding.get("diet_type"),
        }
        profile["cycle_info"] = cycle_info
        profile["phase_info"] = phase_info

    return profile


@router.get("/cycle-info")
async def get_cycle_info(current_user: dict = Depends(get_current_user)):
    """Get detailed current cycle information."""
    health_col = get_health_data_collection()
    user_id = str(current_user["_id"])

    health_data = await health_col.find_one({"user_id": user_id})
    if not health_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Health data not found. Please complete onboarding first."
        )

    onboarding = health_data.get("onboarding_data", {})
    from datetime import date
    last_period = date.fromisoformat(onboarding["last_period_date"])
    cycle_info = calculate_cycle_info(
        last_period,
        onboarding.get("avg_cycle_length", 28),
        onboarding.get("avg_period_duration", 5)
    )
    phase_info = get_phase_description(cycle_info.cycle_phase)

    return {
        "cycle_info": cycle_info.model_dump(mode="json"),
        "phase_info": phase_info
    }