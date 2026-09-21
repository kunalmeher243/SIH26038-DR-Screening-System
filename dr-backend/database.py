from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

# We can use a local mongodb URL if the env variable isn't provided
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")

client = AsyncIOMotorClient(MONGODB_URL)
db = client["serix_db"]

tickets_col = db["tickets"]
slots_col = db["slots"]
messages_col = db["messages"]
doctors_col = db["doctors"]

# Dummy hardcoded doctor details
DOCTORS = [
    {"id": 1, "name": "Dr. Sharma", "specialization": "Ophthalmology"},
    {"id": 2, "name": "Dr. Patel",  "specialization": "Ophthalmology"},
    {"id": 3, "name": "Dr. Reddy",  "specialization": "Ophthalmology"},
]

async def init_db():
    """Seed the doctors collection with dummy data if it's empty."""
    count = await doctors_col.count_documents({})
    if count == 0:
        await doctors_col.insert_many(DOCTORS)

