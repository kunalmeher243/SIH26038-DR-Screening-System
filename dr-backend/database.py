import os
from pathlib import Path
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import certifi

# ============================================================
# ENVIRONMENT
# ============================================================

BASE_DIR = Path(__file__).resolve().parent
ENV_FILE = BASE_DIR / ".env"

load_dotenv(ENV_FILE)

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
MONGO_TIMEOUT_MS = int(os.getenv("MONGO_TIMEOUT_MS", "2500"))
DB_NAME = os.getenv("DB_NAME", "serix_db")

# ============================================================
# CLIENT CONFIGURATION
# ============================================================

client_kwargs = {
    "serverSelectionTimeoutMS": MONGO_TIMEOUT_MS,
    "connectTimeoutMS": MONGO_TIMEOUT_MS,
    "socketTimeoutMS": MONGO_TIMEOUT_MS,
}

if (
    "mongodb+srv://" in MONGODB_URL
    or "ssl=true" in MONGODB_URL.lower()
    or "tls=true" in MONGODB_URL.lower()
):
    client_kwargs["tlsCAFile"] = certifi.where()

try:
    _mongo_client = AsyncIOMotorClient(MONGODB_URL, **client_kwargs)
except Exception as e:
    _mongo_client = None

_active_db = None
is_mock = False


def get_db():
    global _active_db, _mongo_client
    if _active_db is None:
        if _mongo_client is not None:
            _active_db = _mongo_client[DB_NAME]
        else:
            from mongomock_motor import AsyncMongoMockClient
            _active_db = AsyncMongoMockClient()[DB_NAME]
    return _active_db


# ============================================================
# COLLECTION PROXY
# ============================================================

class CollectionProxy:
    """
    Proxy collection that dynamically forwards operations
    to the active MongoDB database (live Motor or MongoMock).
    """

    def __init__(self, name: str):
        self._name = name

    @property
    def _target(self):
        return get_db()[self._name]

    def __getattr__(self, name: str):
        return getattr(self._target, name)

    def __getitem__(self, item):
        return self._target[item]

    def __repr__(self):
        return f"<CollectionProxy {self._name}>"


# ============================================================
# COLLECTIONS
# ============================================================

tickets_col = CollectionProxy("tickets")
slots_col = CollectionProxy("slots")
messages_col = CollectionProxy("messages")
doctors_col = CollectionProxy("doctors")
users_col = CollectionProxy("users")


# ============================================================
# DOCTORS SEED DATA
# ============================================================

DOCTORS = [
    {
        "id": 1,
        "name": "Dr. Sharma",
        "specialization": "Ophthalmology"
    },
    {
        "id": 2,
        "name": "Dr. Patel",
        "specialization": "Ophthalmology"
    },
    {
        "id": 3,
        "name": "Dr. Reddy",
        "specialization": "Ophthalmology"
    }
]


# ============================================================
# DATABASE INITIALIZATION
# ============================================================

async def init_db():
    """
    Verify database connection and seed initial collections.
    Gracefully falls back to in-memory AsyncMongoMockClient if
    remote Atlas or local MongoDB service is unreachable.
    """
    global _mongo_client, _active_db, is_mock

    # 1. Test live MongoDB connection
    live_ok = False
    if _mongo_client is not None:
        try:
            await _mongo_client.admin.command("ping")
            _active_db = _mongo_client[DB_NAME]
            live_ok = True
            host_display = MONGODB_URL.split("@")[-1] if "@" in MONGODB_URL else MONGODB_URL
            print(f"[database] [OK] Connected to live MongoDB: {host_display}")
        except Exception as exc:
            print(f"[database] [WARN] MongoDB connection check failed ({type(exc).__name__}: {exc}).")

    if not live_ok:
        try:
            from mongomock_motor import AsyncMongoMockClient
            mock_client = AsyncMongoMockClient()
            _active_db = mock_client[DB_NAME]
            is_mock = True
            print("[database] [INFO] Activated in-memory AsyncMongoMockClient fallback for seamless offline operation.")
        except Exception as exc:
            print(f"[database] [FAIL] Failed to initialize mongomock fallback: {exc}")
            raise

    # 2. Seed doctors if empty
    try:
        count = await doctors_col.count_documents({})
        if count == 0:
            await doctors_col.insert_many(DOCTORS)
            print("[database] [OK] Seeded demo doctors.")
        else:
            print(f"[database] [INFO] Doctors collection contains {count} records.")
    except Exception as exc:
        print(f"[database] [WARN] Could not check/seed doctors: {exc}")

    # 3. Seed demo users
    try:
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

        demo_users = [
            {
                "name": "PHC Healthcare Worker",
                "email": "phc@demo.com",
                "password_hash": pwd_context.hash("password"),
                "role": "phc_worker"
            },
            {
                "name": "PHC Healthcare Worker",
                "email": "phc@serix.health",
                "password_hash": pwd_context.hash("password123"),
                "role": "phc_worker"
            },
            {
                "name": "Dr. Sharma",
                "email": "doctor@demo.com",
                "password_hash": pwd_context.hash("password"),
                "role": "doctor"
            },
            {
                "name": "Dr. Sharma",
                "email": "doctor@serix.health",
                "password_hash": pwd_context.hash("password123"),
                "role": "doctor"
            },
            {
                "name": "Demo Patient",
                "email": "patient@demo.com",
                "password_hash": pwd_context.hash("password"),
                "role": "patient"
            },
            {
                "name": "Demo Patient",
                "email": "patient@serix.health",
                "password_hash": pwd_context.hash("password123"),
                "role": "patient"
            }
        ]

        for user in demo_users:
            existing = await users_col.find_one({"email": user["email"]})
            if not existing:
                await users_col.insert_one(user)
                print(f"[database] [OK] Seeded user: {user['email']} ({user['role']})")

        print("[database] [OK] Database initialization complete.")
    except Exception as exc:
        print(f"[database] [WARN] Could not check/seed demo users: {exc}")