import asyncio
import traceback
from fastapi import UploadFile
import io
from main import create_ticket

async def run_test():
    img_bytes = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
    file = UploadFile(filename="test.png", file=io.BytesIO(img_bytes))
    
    try:
        res = await create_ticket(
            patient_name="test",
            patient_email="test@test.com",
            doctor_id=1,
            file=file
        )
        print("SUCCESS:", res)
    except Exception as e:
        print("CRASHED!")
        traceback.print_exc()

asyncio.run(run_test())
