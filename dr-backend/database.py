from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

# We can use a local mongodb URL if the env variable isn't provided
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")

import certifi
client = AsyncIOMotorClient(MONGODB_URL, tlsCAFile=certifi.where())
db = client["serix_db"]

tickets_col = db["tickets"]
slots_col = db["slots"]
messages_col = db["messages"]
doctors_col = db["doctors"]
users_col = db["users"]

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
        
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    demo_users = [
        {"name": "Demo PHC Worker", "email": "phc@demo.com", "password_hash": pwd_context.hash("password"), "role": "phc_worker"},
        {"name": "Dr. Sharma", "email": "doctor@demo.com", "password_hash": pwd_context.hash("password"), "role": "doctor"},
        {"name": "Dr. Patel", "email": "patel@demo.com", "password_hash": pwd_context.hash("password"), "role": "doctor"},
        {"name": "Dr. Reddy", "email": "reddy@demo.com", "password_hash": pwd_context.hash("password"), "role": "doctor"},
        {"name": "Demo Patient", "email": "patient@demo.com", "password_hash": pwd_context.hash("password"), "role": "patient"}
    ]
    for user in demo_users:
        existing = await users_col.find_one({"email": user["email"]})
        if not existing:
            await users_col.insert_one(user)

