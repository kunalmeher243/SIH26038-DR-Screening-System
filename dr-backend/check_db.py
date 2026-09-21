import asyncio
from database import tickets_col

async def check():
    ticket = await tickets_col.find_one({}, sort=[("created_at", -1)])
    print(ticket)

asyncio.run(check())
