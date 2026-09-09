import json

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse

from dummy.dummy_responses import DUMMY_REPORT
from utils.pdf_generator import build_clinical_report_pdf

router = APIRouter()


@router.post("/report")
async def generate_report(file: UploadFile = File(...)):
    return DUMMY_REPORT


@router.post("/report/pdf")
async def generate_clinical_report_pdf(
    report_data: str = Form(...),
    file: UploadFile | None = File(default=None),
):
    try:
        data = json.loads(report_data)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail="Invalid report data.") from exc

    image_bytes = None
    if file is not None:
        image_bytes = await file.read()

    try:
        pdf_bytes = build_clinical_report_pdf(data, image_bytes)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Clinical PDF generation failed: {exc}",
        ) from exc

    filename = "SERIX_Clinical_Report.pdf"
    return StreamingResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        },
    )
