import json

from fastapi import (
    APIRouter,
    File,
    Form,
    HTTPException,
    UploadFile,
)

from services.whatsapp_service import (
    send_pdf,
    validate_recipient,
)

from utils.pdf_generator import (
    build_clinical_report_pdf,
)


router = APIRouter(
    prefix="/whatsapp",
    tags=["WhatsApp"],
)


# =========================================================
# VALIDATE WHATSAPP NUMBER
# =========================================================

@router.post("/validate")
async def validate_whatsapp_number(
    payload: dict
):
    """
    Validate the recipient's phone number format.
    """

    phone_number = payload.get(
        "phone_number",
        ""
    )

    if not phone_number:
        raise HTTPException(
            status_code=400,
            detail="Phone number is required.",
        )

    return await validate_recipient(
        phone_number
    )


# =========================================================
# SEND CLINICAL REPORT
# =========================================================

@router.post("/send-report")
async def send_report_to_whatsapp(
    phone_number: str = Form(...),
    report_data: str = Form(...),
    file: UploadFile | None = File(
        default=None
    ),
):
    """
    Generate the clinical report PDF and
    prepare/send it through WhatsApp.
    """

    # -----------------------------------------------------
    # Validate phone number
    # -----------------------------------------------------

    if not phone_number.strip():
        raise HTTPException(
            status_code=400,
            detail="Phone number is required.",
        )

    # -----------------------------------------------------
    # Parse report data
    # -----------------------------------------------------

    try:

        data = json.loads(report_data)

    except json.JSONDecodeError:

        raise HTTPException(
            status_code=400,
            detail="Invalid report_data JSON.",
        )

    # -----------------------------------------------------
    # Read uploaded retinal image
    # -----------------------------------------------------

    image_bytes = None

    if file is not None:

        image_bytes = await file.read()

    # -----------------------------------------------------
    # Generate PDF
    # -----------------------------------------------------

    try:

        pdf_bytes = build_clinical_report_pdf(
            data,
            image_bytes,
        )

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                "Clinical report PDF generation failed: "
                f"{str(exc)}"
            ),
        )

    # -----------------------------------------------------
    # PDF filename
    # -----------------------------------------------------

    filename = "SERIX_Clinical_Report.pdf"

    # -----------------------------------------------------
    # Send / prepare WhatsApp report
    #
    # IMPORTANT:
    # send_pdf accepts:
    #     phone_number
    #     pdf_bytes
    #     filename
    # -----------------------------------------------------

    return await send_pdf(
        phone_number,
        pdf_bytes,
        filename,
    )