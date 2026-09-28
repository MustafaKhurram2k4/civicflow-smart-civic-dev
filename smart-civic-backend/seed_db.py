import asyncio

from motor.motor_asyncio import AsyncIOMotorClient

from config import settings


async def seed():
    print(f"Connecting to MongoDB at {settings.MONGODB_URL}...")
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]

    await db["counters"].update_one(
        {"_id": "complaint_id"},
        {"$setOnInsert": {"seq": 0}},
        upsert=True,
    )

    count = await db["complaints"].count_documents({})
    print(f"Database contains {count} complaints. No sample complaints were inserted.")

    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
