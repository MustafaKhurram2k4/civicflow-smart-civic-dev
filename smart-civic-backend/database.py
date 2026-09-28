import logging
from datetime import datetime
from typing import Any, Dict, List

from motor.motor_asyncio import AsyncIOMotorClient

from config import settings

logger = logging.getLogger(__name__)


class MemoryStore:
    def __init__(self):
        self.complaints: List[Dict[str, Any]] = []
        self.users: List[Dict[str, Any]] = []
        self.seq_counter: int = 0

    def get_next_id(self) -> str:
        self.seq_counter += 1
        year = datetime.utcnow().year
        return f"CIV-{year}-{self.seq_counter:04d}"


memory_store = MemoryStore()


class Database:
    client: AsyncIOMotorClient = None
    db = None


db_container = Database()


async def connect_to_mongo():
    logger.info(f"Attempting MongoDB connection at {settings.MONGODB_URL}...")
    try:
        client = AsyncIOMotorClient(settings.MONGODB_URL, serverSelectionTimeoutMS=2000)
        await client.admin.command("ping")
        db = client[settings.DATABASE_NAME]
        db_container.client = client
        db_container.db = db
        logger.info(f"Connected to MongoDB database '{settings.DATABASE_NAME}' successfully!")
    except Exception as e:
        logger.warning(f"MongoDB not available at {settings.MONGODB_URL} ({e}). Using fast in-memory store mode.")
        db_container.db = None


async def close_mongo_connection():
    if db_container.client:
        logger.info("Closing MongoDB connection.")
        db_container.client.close()


def get_database():
    return db_container.db
