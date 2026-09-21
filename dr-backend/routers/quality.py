from fastapi import APIRouter, UploadFile, File
from dummy.dummy_responses import DUMMY_QUALITY

router = APIRouter()


@router.post("/quality")
async def assess_quality(file: UploadFile = File(...)):
    return DUMMY_QUALITY