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

MONGODB_URL = os.getenv("MONGODB_URL")
DB_NAME = os.getenv("DB_NAME", "serix_db")
MONGO_TIMEOUT_MS = int(
    os.getenv("MONGO_TIMEOUT_MS", "10000")
)

if not MONGODB_URL:
    raise RuntimeError(
        f"MONGODB_URL missing in {ENV_FILE}"
    )


# ============================================================
# MONGODB CLIENT
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


client = AsyncIOMotorClient(
    MONGODB_URL,
    **client_kwargs
)

db = client[DB_NAME]


# ============================================================
# COLLECTIONS
# ============================================================

users_col = db["users"]
tickets_col = db["tickets"]
messages_col = db["messages"]
slots_col = db["slots"]
doctors_col = db["doctors"]


# ============================================================
# DATABASE INITIALIZATION
# ============================================================

async def init_db():

    try:

        await client.admin.command("ping")

        host_display = (
            MONGODB_URL.split("@")[-1]
            if "@" in MONGODB_URL
            else MONGODB_URL
        )

        print(
            f"[database] [OK] Connected to MongoDB Atlas: "
            f"{host_display}"
        )

    except Exception as exc:

        print(
            "[database] [FAIL] MongoDB connection failed:"
        )

        print(
            f"[database] {type(exc).__name__}: {exc}"
        )

        raise


    # --------------------------------------------------------
    # USER INDEX
    # --------------------------------------------------------

    try:

        await users_col.create_index(
            "email",
            unique=True
        )

        print(
            "[database] [OK] Unique email index ready."
        )

    except Exception as exc:

        print(
            f"[database] [WARN] User index: {exc}"
        )


    # --------------------------------------------------------
    # TICKET INDEXES
    # --------------------------------------------------------

    try:

        await tickets_col.create_index(
            "assigned_doctor_id"
        )

        await tickets_col.create_index(
            "status"
        )

        await tickets_col.create_index(
            "created_by"
        )

        print(
            "[database] [OK] Ticket indexes ready."
        )

    except Exception as exc:

        print(
            f"[database] [WARN] Ticket indexes: {exc}"
        )


    print(
        "[database] [OK] Database initialization complete."
    )