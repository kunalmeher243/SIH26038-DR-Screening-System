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
