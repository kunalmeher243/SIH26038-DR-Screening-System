import os
from typing import Any

import httpx
from dotenv import load_dotenv
from fastapi import HTTPException


# Load environment variables from backend/.env
load_dotenv()


def normalize_phone(phone_number: str) -> str:
    """
    Remove spaces, brackets, hyphens and other non-numeric characters.
    """
    value = "".join(
        ch for ch in (phone_number or "")
        if ch.isdigit()
    )
    return value


def validate_phone_format(phone_number: str) -> tuple[bool, str]:
    """
    Validate basic international/E.164-style phone number format.

    This does NOT verify whether the number actually has a WhatsApp account.
    Meta determines recipient deliverability when a real message is sent.
    """
    normalized = normalize_phone(phone_number)

    # E.164 allows a maximum of 15 digits.
    # We require a country code, therefore it cannot start with 0.
    valid = (
        8 <= len(normalized) <= 15
        and not normalized.startswith("0")
    )

    return valid, normalized


def _settings() -> tuple[str, str, str]:
    """
    Read WhatsApp configuration from environment variables.
    """
    token = os.getenv(
        "WHATSAPP_ACCESS_TOKEN",
        ""
    ).strip()

    phone_number_id = os.getenv(
        "WHATSAPP_PHONE_NUMBER_ID",
        ""
    ).strip()

    version = os.getenv(
        "WHATSAPP_GRAPH_API_VERSION",
        "v23.0"
    ).strip()

    return token, phone_number_id, version


def is_configured() -> bool:
    """
    Return True when live Meta WhatsApp credentials are configured.
    """
    token, phone_number_id, _ = _settings()

    return bool(
        token and phone_number_id
    )


async def validate_recipient(
    phone_number: str,
) -> dict[str, Any]:
    """
    Validate recipient phone number format.

    In Demo Mode:
        The number format is validated locally.

    In Live Mode:
        The number format is validated locally and Meta will determine
        actual recipient deliverability during the send operation.
    """

    valid_format, normalized = validate_phone_format(
        phone_number
    )

    demo_mode = not is_configured()

    if not valid_format:
        return {
            "valid_format": False,
            "whatsapp_valid": False,
            "normalized_number": normalized,
            "demo_mode": demo_mode,
            "message": (
                "Enter a valid international phone number "
                "with country code."
            ),
        }

    if demo_mode:
        return {
            "valid_format": True,
            "whatsapp_valid": None,
            "normalized_number": normalized,
            "demo_mode": True,
            "message": "Number format verified.",
        }

    return {
        "valid_format": True,
        "whatsapp_valid": None,
        "normalized_number": normalized,
        "demo_mode": False,
        "message": (
            "Number format verified. Meta will confirm "
            "recipient deliverability when the report is sent."
        ),
    }


async def send_pdf(
    phone_number: str,
    pdf_bytes: bytes,
    filename: str = "SERIX_Clinical_Report.pdf",
) -> dict[str, Any]:
    """
    Send the generated clinical PDF through WhatsApp.

    If Meta credentials are not configured, the function runs in
    Demo Mode and simulates successful delivery.

    If Meta credentials are configured, the PDF is uploaded to
    Meta WhatsApp Cloud API and then sent as a document message.
    """

    token, phone_number_id, version = _settings()

    # ---------------------------------------------------------
    # DEMO MODE
    # ---------------------------------------------------------
    if not token or not phone_number_id:
        valid_format, normalized = validate_phone_format(
            phone_number
        )

        if not valid_format:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid international WhatsApp "
                    "number format."
                ),
            )

        return {
            "sent": True,
            "demo_mode": True,
            "normalized_number": normalized,
            "message": "Clinical report successfully send to number. ",
        }

    # ---------------------------------------------------------
    # LIVE MODE
    # ---------------------------------------------------------

    valid_format, normalized = validate_phone_format(
        phone_number
    )

    if not valid_format:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid international WhatsApp "
                "number format."
            ),
        )

    base_url = (
        f"https://graph.facebook.com/"
        f"{version}/"
        f"{phone_number_id}"
    )

    headers = {
        "Authorization": f"Bearer {token}"
    }

    try:
        async with httpx.AsyncClient(
            timeout=35.0
        ) as client:

            # -------------------------------------------------
            # STEP 1: Upload PDF to Meta
            # -------------------------------------------------

            media_response = await client.post(
                f"{base_url}/media",
                headers=headers,
                data={
                    "messaging_product": "whatsapp"
                },
                files={
                    "file": (
                        filename,
                        pdf_bytes,
                        "application/pdf",
                    )
                },
            )

            if media_response.is_error:
                _raise_meta_error(
                    media_response,
                    "WhatsApp media upload failed.",
                )

            media_id = (
                media_response
                .json()
                .get("id")
            )

            if not media_id:
                raise HTTPException(
                    status_code=502,
                    detail=(
                        "WhatsApp media upload returned "
                        "no media ID."
                    ),
                )

            # -------------------------------------------------
            # STEP 2: Send PDF document through WhatsApp
            # -------------------------------------------------

            message_response = await client.post(
                f"{base_url}/messages",
                headers={
                    **headers,
                    "Content-Type": "application/json",
                },
                json={
                    "messaging_product": "whatsapp",
                    "recipient_type": "individual",
                    "to": normalized,
                    "type": "document",
                    "document": {
                        "id": media_id,
                        "caption": (
                            "SERIX Clinical Screening Report"
                        ),
                        "filename": filename,
                    },
                },
            )

            if message_response.is_error:
                _raise_meta_error(
                    message_response,
                    "WhatsApp report delivery failed.",
                )

            payload = message_response.json()

            message_id = None

            messages = (
                payload.get("messages")
                or []
            )

            if messages:
                message_id = messages[0].get("id")

            return {
                "sent": True,
                "demo_mode": False,
                "normalized_number": normalized,
                "message_id": message_id,
                "message": (
                    "Clinical report sent to WhatsApp "
                    "successfully."
                ),
            }

    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=503,
            detail=(
                "Unable to connect to the WhatsApp "
                f"Cloud API: {exc}"
            ),
        ) from exc


def _raise_meta_error(
    response: httpx.Response,
    fallback: str,
) -> None:
    """
    Convert Meta API errors into readable FastAPI errors.
    """

    try:
        payload = response.json()

        error = (
            payload.get("error")
            or {}
        )

        message = (
            error.get("message")
            or fallback
        )

        code = error.get("code")

        if code:
            message = (
                f"{message} "
                f"(Meta error {code})"
            )

    except Exception:
        message = fallback

    raise HTTPException(
        status_code=502,
        detail=message,
    )