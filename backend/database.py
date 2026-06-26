"""
CycleWise - Database Connection Module
Handles MongoDB Atlas connection using Motor (async MongoDB driver)
"""

import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")

# Global database client instance
client: AsyncIOMotorClient = None
db = None


async def connect_to_mongo():
    """Initialize MongoDB connection on app startup."""
    global client, db
    print("🔌 Connecting to MongoDB Atlas...")
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client.cyclewise

    # Ping the database to verify connection
    await client.admin.command("ping")
    print("✅ Successfully connected to MongoDB Atlas!")


async def close_mongo_connection():
    """Close MongoDB connection on app shutdown."""
    global client
    if client:
        client.close()
        print("🔒 MongoDB connection closed.")


def get_database():
    return db


def get_users_collection():
    return db["users"]


def get_health_data_collection():
    return db["health_data"]


def get_predictions_collection():
    return db["predictions"]


def get_cycle_logs_collection():
    return db["cycle_logs"]