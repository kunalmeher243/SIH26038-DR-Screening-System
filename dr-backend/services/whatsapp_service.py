import os
from typing import Any

import httpx
from dotenv import load_dotenv
from fastapi import HTTPException


# =========================================================
# LOAD ENVIRONMENT VARIABLES
# =========================================================

load_dotenv()


# =========================================================
# PHONE NUMBER HELPERS
# =========================================================

def normalize_phone(phone_number: str) -> str:
    """
    Convert a phone number into digits only.

    Examples:
        +91 8249410332 -> 918249410332
        +91-82494-10332 -> 918249410332
    """

    return "".join(
        ch
        for ch in (phone_number or "")
        if ch.isdigit()
    )


def validate_phone_format(phone_number: str) -> tuple[bool, str]:
    """
    Validate basic international/E.164-style format.

    This validates the number format only.
    It does NOT prove that the number has a WhatsApp account.
    Meta determines actual recipient deliverability when sending.
    """

    normalized = normalize_phone(phone_number)

    valid = (
        8 <= len(normalized) <= 15
        and not normalized.startswith("0")
    )

    return valid, normalized


# =========================================================
# ENVIRONMENT / META SETTINGS
# =========================================================

def _clean_env_value(value: str | None) -> str:
    """
    Clean an environment variable value.

    Removes accidental surrounding spaces or quotes.
    """

    value = (value or "").strip()

    if (
        len(value) >= 2
        and value[0] == value[-1]
        and value[0] in {"'", '"'}
    ):
        value = value[1:-1].strip()

    return value


def _settings() -> tuple[str, str, str]:
    """
    Read Meta WhatsApp Cloud API configuration.
    """

    token = _clean_env_value(
        os.getenv("WHATSAPP_ACCESS_TOKEN")
    )

    phone_number_id = _clean_env_value(
        os.getenv("WHATSAPP_PHONE_NUMBER_ID")
    )

    version = _clean_env_value(
        os.getenv(
            "WHATSAPP_GRAPH_API_VERSION",
            "v23.0",
        )
    )

    return token, phone_number_id, version


def is_configured() -> bool:
    """
    Return True when required Meta credentials exist.
    """

    token, phone_number_id, _ = _settings()

    return bool(
        token and phone_number_id
    )


# =========================================================
# RECIPIENT VALIDATION
# =========================================================

async def validate_recipient(
    phone_number: str,
) -> dict[str, Any]:
    """
    Validate phone number format.

    Important:
    WhatsApp Cloud API does not provide a dependable
    public pre-send endpoint that guarantees a recipient
    has a WhatsApp account.

    Therefore this function validates the international
    phone number format. Meta performs actual delivery
    validation during message sending.
    """

    valid_format, normalized = validate_phone_format(
        phone_number
    )

    if not valid_format:
        return {
            "valid_format": False,
            "whatsapp_valid": False,
            "normalized_number": normalized,
            "message": (
                "Enter a valid international phone number "
                "with country code."
            ),
        }

    return {
        "valid_format": True,
        "whatsapp_valid": None,
        "normalized_number": normalized,
        "message": (
            "Number format verified. "
            "Meta will confirm recipient deliverability "
            "when the report is sent."
        ),
    }


# =========================================================
# META CREDENTIAL VALIDATION
# =========================================================

async def verify_meta_credentials() -> dict[str, Any]:
    """
    Verify that the configured Meta access token and
    WhatsApp Phone Number ID are usable.

    This is useful for diagnosing OAuth error 190 before
    attempting a PDF upload.
    """

    token, phone_number_id, version = _settings()

    if not token:
        raise HTTPException(
            status_code=503,
            detail=(
                "WHATSAPP_ACCESS_TOKEN is missing from "
                "the backend .env file."
            ),
        )

    if not phone_number_id:
        raise HTTPException(
            status_code=503,
            detail=(
                "WHATSAPP_PHONE_NUMBER_ID is missing from "
                "the backend .env file."
            ),
        )

    base_url = (
        f"https://graph.facebook.com/"
        f"{version}/"
        f"{phone_number_id}"
    )

    headers = {
        "Authorization": f"Bearer {token}",
    }

    try:
        async with httpx.AsyncClient(
            timeout=20.0
        ) as client:

            response = await client.get(
                base_url,
                headers=headers,
                params={
                    "fields": (
                        "display_phone_number,"
                        "verified_name,"
                        "quality_rating"
                    )
                },
            )

    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=503,
            detail=(
                "Unable to connect to Meta Graph API: "
                f"{str(exc)}"
            ),
        ) from exc

    if response.is_error:
        _raise_meta_error(
            response,
            (
                "Meta credentials could not be verified. "
                "Check your access token and WhatsApp "
                "Phone Number ID."
            ),
        )

    try:
        payload = response.json()
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=(
                "Meta returned an invalid credentials "
                f"response: {str(exc)}"
            ),
        ) from exc

    return {
        "configured": True,
        "verified": True,
        "phone_number_id": phone_number_id,
        "version": version,
        "meta": payload,
        "message": (
            "Meta WhatsApp credentials verified successfully."
        ),
    }


# =========================================================
# SEND PDF THROUGH WHATSAPP
# =========================================================

async def send_pdf(
    phone_number: str,
    pdf_bytes: bytes,
    filename: str = "SERIX_Clinical_Report.pdf",
) -> dict[str, Any]:
    """
    Upload the generated clinical PDF to Meta WhatsApp
    Cloud API and send it as a document message.

    There is NO Demo Mode here.
    If Meta credentials are missing or invalid, the API
    returns an appropriate error instead of pretending
    that the report was sent.
    """

    # -----------------------------------------------------
    # Validate recipient number
    # -----------------------------------------------------

    valid_format, normalized = validate_phone_format(
        phone_number
    )

    if not valid_format:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid international WhatsApp number format. "
                "Use the country code and do not start with 0."
            ),
        )

    # -----------------------------------------------------
    # Read Meta credentials
    # -----------------------------------------------------

    token, phone_number_id, version = _settings()

    if not token:
        raise HTTPException(
            status_code=503,
            detail=(
                "WhatsApp is not configured. "
                "WHATSAPP_ACCESS_TOKEN is missing from "
                "backend/.env."
            ),
        )

    if not phone_number_id:
        raise HTTPException(
            status_code=503,
            detail=(
                "WhatsApp is not configured. "
                "WHATSAPP_PHONE_NUMBER_ID is missing from "
                "backend/.env."
            ),
        )

    # -----------------------------------------------------
    # Meta Graph API base URL
    # -----------------------------------------------------

    base_url = (
        f"https://graph.facebook.com/"
        f"{version}/"
        f"{phone_number_id}"
    )

    headers = {
        "Authorization": f"Bearer {token}",
    }

    try:

        async with httpx.AsyncClient(
            timeout=35.0
        ) as client:

            # =================================================
            # STEP 1
            # Verify Meta credentials
            # =================================================

            credential_response = await client.get(
                base_url,
                headers=headers,
                params={
                    "fields": (
                        "display_phone_number,"
                        "verified_name,"
                        "quality_rating"
                    )
                },
            )

            if credential_response.is_error:
                _raise_meta_error(
                    credential_response,
                    (
                        "Meta credentials are invalid. "
                        "Please check your WhatsApp access token "
                        "and Phone Number ID."
                    ),
                )

            # =================================================
            # STEP 2
            # Upload PDF to Meta
            # =================================================

            media_response = await client.post(
                f"{base_url}/media",
                headers=headers,
                data={
                    "messaging_product": "whatsapp",
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

            try:
                media_payload = media_response.json()
            except Exception:
                raise HTTPException(
                    status_code=502,
                    detail=(
                        "Meta returned an invalid response "
                        "during PDF upload."
                    ),
                )

            media_id = media_payload.get("id")

            if not media_id:
                raise HTTPException(
                    status_code=502,
                    detail=(
                        "Meta accepted the PDF request but "
                        "returned no media ID."
                    ),
                )

            # =================================================
            # STEP 3
            # Send PDF document
            # =================================================

            message_payload = {
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
            }

            message_response = await client.post(
                f"{base_url}/messages",
                headers={
                    **headers,
                    "Content-Type": "application/json",
                },
                json=message_payload,
            )

            if message_response.is_error:
                _raise_meta_error(
                    message_response,
                    "WhatsApp report delivery failed.",
                )

            try:
                payload = message_response.json()
            except Exception:
                raise HTTPException(
                    status_code=502,
                    detail=(
                        "Meta returned an invalid response "
                        "after sending the WhatsApp report."
                    ),
                )

            # -------------------------------------------------
            # Extract message ID
            # -------------------------------------------------

            messages = payload.get("messages") or []

            message_id = None

            if messages:
                message_id = messages[0].get("id")

            return {
                "sent": True,
                "demo_mode": False,
                "normalized_number": normalized,
                "message_id": message_id,
                "media_id": media_id,
                "message": (
                    "Clinical report sent to WhatsApp "
                    "successfully."
                ),
            }

    except httpx.RequestError as exc:

        raise HTTPException(
            status_code=503,
            detail=(
                "Unable to connect to the Meta WhatsApp "
                f"Cloud API: {str(exc)}"
            ),
        ) from exc


# =========================================================
# META ERROR HANDLER
# =========================================================

def _raise_meta_error(
    response: httpx.Response,
    fallback: str,
) -> None:
    """
    Convert Meta API errors into useful FastAPI errors.
    """

    try:

        payload = response.json()

        error = payload.get("error") or {}

        message = (
            error.get("message")
            or fallback
        )

        code = error.get("code")

        error_type = error.get("type")

        fbtrace_id = error.get("fbtrace_id")

        # -----------------------------------------------------
        # OAuth error 190
        # -----------------------------------------------------

        if code == 190:
            message = (
                "Meta rejected the WhatsApp access token "
                "(OAuth error 190). The token is invalid, "
                "expired, revoked, or belongs to an account/app "
                "that does not have access to this WhatsApp "
                "Phone Number ID."
            )

        # -----------------------------------------------------
        # Add Meta error information
        # -----------------------------------------------------

        details = []

        if code:
            details.append(
                f"Meta error code: {code}"
            )

        if error_type:
            details.append(
                f"type: {error_type}"
            )

        if fbtrace_id:
            details.append(
                f"fbtrace_id: {fbtrace_id}"
            )

        if details:
            message += " " + " | ".join(details)

    except Exception:
        message = fallback

    raise HTTPException(
        status_code=502,
        detail=message,
    )