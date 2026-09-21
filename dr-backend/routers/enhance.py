from fastapi import APIRouter, UploadFile, File
from dummy.dummy_responses import DUMMY_ENHANCE

router = APIRouter()


@router.post("/enhance")
async def enhance_image(file: UploadFile = File(...)):
    return DUMMY_ENHANCE