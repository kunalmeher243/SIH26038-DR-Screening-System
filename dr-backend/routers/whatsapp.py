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
    verify_meta_credentials,
)

from utils.pdf_generator import (
    build_clinical_report_pdf,
)


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/whatsapp",
    tags=["WhatsApp"],
)


# =========================================================
# VALIDATE WHATSAPP NUMBER
# =========================================================

@router.post("/validate")
async def validate_whatsapp_number(
    payload: dict,
):
    """
    Validate the recipient phone number format.

    This does not claim that the number has a WhatsApp
    account. Actual deliverability is determined by Meta
    during message delivery.
    """

    phone_number = payload.get(
        "phone_number",
        "",
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
# VERIFY META CONFIGURATION
# =========================================================

@router.get("/status")
async def whatsapp_status():
    """
    Verify the configured Meta WhatsApp Cloud API
    credentials.

    Useful for testing the backend independently from
    the Clinical Report UI.
    """

    return await verify_meta_credentials()


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
    Generate the clinical screening PDF and send it
    through WhatsApp Cloud API.
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

        data = json.loads(
            report_data
        )

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
    # Generate clinical report PDF
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
    # Send PDF through Meta WhatsApp Cloud API
    # -----------------------------------------------------

    return await send_pdf(
        phone_number,
        pdf_bytes,
        filename,
    )