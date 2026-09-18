"""
services/report_service.py
Assembles results from all modules into a clinical report.

Called by the /api/report endpoint.
Runs IQA + Enhancement + Grading + Grad-CAM + Lesion detection internally.
Returns a single unified response for the frontend.
"""

from datetime import datetime, timezone
from fastapi import UploadFile
import io
from services import iqa_service, enhance_service, model_service, gradcam_service


# ── Evidence Statement Generator ─────────────────────────────────────────────

def build_clinical_summary(
    dr_level: int,
    lesions: dict,
    anatomy: dict,
) -> str:
    """
    Builds a human-readable clinical summary sentence.
    This is what the doctor reads — not a probability number.
    """
    parts = []

    level_statements = {
        0: "No diabetic retinopathy detected.",
        1: "Mild non-proliferative DR detected.",
        2: "Moderate non-proliferative DR detected.",
        3: "Severe non-proliferative DR detected.",
        4: "Proliferative DR detected.",
    }
    parts.append(level_statements[dr_level])

    if lesions.get("microaneurysms", 0) > 0:
        parts.append(f"{lesions['microaneurysms']} microaneurysm(s) identified.")

    if lesions.get("hemorrhages", 0) > 0:
        parts.append(f"{lesions['hemorrhages']} retinal hemorrhage(s) identified.")

    if lesions.get("hard_exudates", 0) > 0:
        parts.append(f"{lesions['hard_exudates']} hard exudate region(s) identified.")

    if lesions.get("soft_exudates", 0) > 0:
        parts.append(f"{lesions['soft_exudates']} soft exudate region(s) identified.")

    if lesions.get("neovascularization", False):
        parts.append("Neovascularization detected — immediate referral required.")

    if anatomy.get("fovea_detected") and lesions.get("hard_exudates", 0) > 0:
        parts.append("Exudate proximity to fovea warrants close attention.")

    if dr_level >= 2:
        parts.append("Ophthalmologist referral recommended.")
    else:
        parts.append("No referral required. Annual follow-up advised.")

    return " ".join(parts)


def build_evidence_statement(
    dr_level: int,
    grade_result: dict,
    lesions: dict,
) -> str:
    """
    Technical evidence statement explaining WHY this DR level was assigned.
    Complements Grad-CAM with explicit clinical reasoning.
    """
    conf   = grade_result.get("calibrated_confidence", 0.0)
    pieces = [
        f"DR Level {dr_level} assigned based on:",
        f"classification confidence {conf:.0%}.",
    ]

    evidence = []
    if lesions.get("microaneurysms", 0) > 0:
        evidence.append(f"microaneurysm count ({lesions['microaneurysms']})")
    if lesions.get("hemorrhages", 0) > 0:
        evidence.append(f"hemorrhage presence ({lesions['hemorrhages']})")
    if lesions.get("hard_exudates", 0) > 0:
        evidence.append(f"hard exudate regions ({lesions['hard_exudates']})")
    if lesions.get("neovascularization", False):
        evidence.append("neovascularization detected")

    if evidence:
        pieces.append("Supporting lesion evidence: " + ", ".join(evidence) + ".")

    if dr_level >= 4:
        pieces.append("Emergency referral protocol triggered.")
    elif dr_level == 3:
        pieces.append("Urgent referral recommended.")

    return " ".join(pieces)


# ── Dummy Lesion Fallback ─────────────────────────────────────────────────────
# Used when lesion_service is not yet ready.
# Remove once Person B's lesion_service.py is integrated.

DUMMY_LESIONS = {
    "microaneurysms":    0,
    "hemorrhages":       0,
    "hard_exudates":     0,
    "soft_exudates":     0,
    "neovascularization": False,
}

DUMMY_ANATOMY = {
    "optic_disc_detected": True,
    "fovea_detected":      True,
}

DUMMY_ANNOTATIONS = [
    {
        "label": "Microaneurysms", "short_label": "MA", "color": "#dc0000",
        "description": "Small red retinal lesions.", "count": 0, "detected": False,
    },
    {
        "label": "Haemorrhages", "short_label": "HE", "color": "#ff8c00",
        "description": "Retinal bleeding regions.", "count": 0, "detected": False,
    },
    {
        "label": "Hard Exudates", "short_label": "EX", "color": "#e6e600",
        "description": "Bright lipid exudate regions.", "count": 0, "detected": False,
    },
    {
        "label": "Cotton Wool Spots", "short_label": "SE", "color": "#c800c8",
        "description": "Soft exudates, also called cotton wool spots.",
        "count": 0, "detected": False,
    },
]


def _pdf_escape(value: str) -> str:
    """Escape text for a PDF literal string."""
    value = value.encode("ascii", "replace").decode("ascii")
    return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def report_to_pdf(report: dict) -> bytes:
    """Create a compact PDF from the generated report without extra packages."""
    quality = report.get("quality_assessment", {})
    lines = [
        "SERIX Diabetic Retinopathy Screening Report",
        f"Generated: {report.get('generated_at', '')}",
        "",
        f"Image quality: {quality.get('label', 'UNKNOWN')} "
        f"(score {quality.get('score', 'N/A')})",
        f"Recommendation: {quality.get('recommendation', 'N/A')}",
    ]

    if report.get("lesions") is not None:
        lines.extend(["", "Detected retinal findings:"])
        for annotation in report.get("lesion_annotations", []):
            lines.append(
                f"{annotation.get('label', 'Finding')}: "
                f"{annotation.get('count', 0)}"
            )
        lines.extend([
            "",
            f"Clinical summary: {report.get('clinical_summary', '')}",
            f"Evidence: {report.get('evidence_statement', '')}",
        ])
    else:
        lines.extend([
            "",
            "No DR classification was produced because image quality was ungradable.",
        ])

    wrapped = []
    max_chars = 90
    for line in lines:
        while len(line) > max_chars:
            split_at = line.rfind(" ", 0, max_chars)
            split_at = split_at if split_at > 0 else max_chars
            wrapped.append(line[:split_at])
            line = line[split_at:].lstrip()
        wrapped.append(line)

    content_lines = ["BT", "/F1 12 Tf", "50 760 Td", "16 TL"]
    for line in wrapped:
        content_lines.append(f"({_pdf_escape(line)}) Tj T*" if line else "T*")
    content_lines.append("ET")
    content = "\n".join(content_lines).encode("ascii")

    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        b"<< /Length " + str(len(content)).encode("ascii") + b" >>\nstream\n" + content + b"\nendstream",
    ]
    pdf = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets = [0]
    for index, obj in enumerate(objects, start=1):
        offsets.append(len(pdf))
        pdf.extend(f"{index} 0 obj\n".encode("ascii"))
        pdf.extend(obj)
        pdf.extend(b"\nendobj\n")
    xref = len(pdf)
    pdf.extend(f"xref\n0 {len(objects) + 1}\n".encode("ascii"))
    pdf.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        pdf.extend(f"{offset:010d} 00000 n \n".encode("ascii"))
    pdf.extend(
        f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\n"
        f"startxref\n{xref}\n%%EOF\n".encode("ascii")
    )
    return bytes(pdf)


# ── Main Service Function ─────────────────────────────────────────────────────

async def generate(file: UploadFile) -> dict:
    """
    Entry point called by /api/report FastAPI router.
    Runs full pipeline internally and returns unified report.
    """
    raw_bytes = await file.read()

    # Helper: create a fresh UploadFile-like from raw bytes
    def make_upload(b: bytes, filename: str = "image.png") -> UploadFile:
        return UploadFile(
            filename=filename,
            file=io.BytesIO(b)
        )

    # ── Stage 1: IQA ─────────────────────────────────────────────────────────
    quality_result = await iqa_service.assess(make_upload(raw_bytes))

    # ── Stage 2: Grade ────────────────────────────────────────────────────────
    grade_result = await model_service.grade(make_upload(raw_bytes))
    dr_level     = grade_result["dr_level"]

    # ── Stage 3: Grad-CAM ────────────────────────────────────────────────────
    gradcam_result = await gradcam_service.generate_from_bytes(raw_bytes)

    # ── Stage 4: Lesion Detection ─────────────────────────────────────────────
    # Try importing lesion_service — use dummy if not yet implemented
    try:
        from services import lesion_service
        lesion_result = await lesion_service.detect(make_upload(raw_bytes))
        lesions       = lesion_result["lesions"]
        lesion_overlay = lesion_result.get("lesion_overlay_image", None)
        lesion_annotations = lesion_result.get("lesion_annotations", DUMMY_ANNOTATIONS)
    except (ImportError, Exception):
        # Lesion service not ready yet — use dummy
        lesions        = DUMMY_LESIONS
        lesion_overlay = None
        lesion_annotations = DUMMY_ANNOTATIONS

    # ── Stage 5: Anatomy ─────────────────────────────────────────────────────
    try:
        from services import anatomy_service
        anatomy_result = await anatomy_service.segment(make_upload(raw_bytes))
        anatomy        = anatomy_result["anatomy"]
    except (ImportError, Exception):
        anatomy = DUMMY_ANATOMY

    # ── Assemble ─────────────────────────────────────────────────────────────
    clinical_summary  = build_clinical_summary(dr_level, lesions, anatomy)
    evidence_statement = build_evidence_statement(dr_level, grade_result, lesions)

    return {
        "quality_assessment": {
            "label": quality_result["quality_label"],
            "gradable": quality_result["gradable"],
            "score": quality_result["quality_score"],
            "issues": quality_result["issues"],
            "recommendation": quality_result["recommendation"],
        },
        "gradcam_image":        gradcam_result["gradcam_image"],
        "gradcam_image_base64": gradcam_result["gradcam_image_base64"],
        "lesion_overlay_image": lesion_overlay,
        "lesion_annotations":   lesion_annotations,
        "lesions":              lesions,
        "anatomy":              anatomy,
        "clinical_summary":     clinical_summary,
        "evidence_statement":   evidence_statement,
        "confidence_breakdown": {
            "image_quality":     quality_result["quality_score"],
            "classification":    grade_result["calibrated_confidence"],
            "lesion_detection":  0.80,   # update when lesion model has confidence output
        },
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }
