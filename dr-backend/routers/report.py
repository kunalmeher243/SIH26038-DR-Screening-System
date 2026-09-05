from fastapi import APIRouter, UploadFile, File
from dummy.dummy_responses import DUMMY_REPORT

router = APIRouter()


@router.post("/report")
async def generate_report(file: UploadFile = File(...)):
    return DUMMY_REPORT