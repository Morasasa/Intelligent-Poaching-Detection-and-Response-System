from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import PyMongoError
from core.config import settings

class MongoDB:
    client = None
    db = None

db = MongoDB()

async def connect_to_mongo():
    try:
        db.client = AsyncIOMotorClient(settings.MONGO_URI, serverSelectionTimeoutMS=5000)
        db.db = db.client[settings.DATABASE_NAME]

        # Verify connection before app startup continues.
        await db.client.admin.command("ping")

        # Create indexes
        await db.db.users.create_index("email", unique=True)

        print(f"Connected to MongoDB: {settings.DATABASE_NAME}")
    except PyMongoError as exc:
        raise RuntimeError(
            "MongoDB is not running. Start MongoDB on localhost:27017 and restart the backend."
        ) from exc

async def close_mongo_connection():
    if db.client:
        db.client.close()
        print("Closed MongoDB connection")

def get_database():
    return db.db
