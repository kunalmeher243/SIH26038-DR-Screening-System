from fastapi import APIRouter, UploadFile, File
from dummy.dummy_responses import DUMMY_GRADE

router = APIRouter()


@router.post("/grade")
async def grade_image(file: UploadFile = File(...)):
    return DUMMY_GRADE