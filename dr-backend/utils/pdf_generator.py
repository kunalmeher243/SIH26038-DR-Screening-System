from io import BytesIO
from datetime import datetime, timezone
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, KeepTogether
from PIL import Image as PILImage


def build_clinical_report_pdf(report_data: dict, image_bytes: bytes | None = None) -> bytes:
    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=16 * mm,
        bottomMargin=16 * mm,
        title="SERIX Clinical Screening Report",
        author="SERIX Retinal Screening System",
    )

    styles = getSampleStyleSheet()
    title = ParagraphStyle(
        "ReportTitle", parent=styles["Title"], fontSize=22,
        leading=26, alignment=TA_CENTER, textColor=colors.HexColor("#16304f"),
        spaceAfter=6,
    )
    subtitle = ParagraphStyle(
        "ReportSubtitle", parent=styles["Normal"], fontSize=9.5,
        leading=14, alignment=TA_CENTER, textColor=colors.HexColor("#64748b"),
        spaceAfter=16,
    )
    heading = ParagraphStyle(
        "ReportHeading", parent=styles["Heading2"], fontSize=13,
        leading=17, textColor=colors.HexColor("#16304f"), spaceBefore=10,
        spaceAfter=7,
    )
    body = ParagraphStyle(
        "ReportBody", parent=styles["BodyText"], fontSize=9.2,
        leading=13.5, textColor=colors.HexColor("#334155"), spaceAfter=5,
    )
    small = ParagraphStyle(
        "ReportSmall", parent=body, fontSize=7.5, leading=10.5,
        textColor=colors.HexColor("#64748b"),
    )

    def pct(value):
        try:
            return f"{float(value) * 100:.0f}%"
        except (TypeError, ValueError):
            return "—"

    lesions = report_data.get("lesions") or {}
    confidence = report_data.get("confidence_breakdown") or {}

    story = [
        Paragraph("SERIX", title),
        Paragraph("Clinical Diabetic Retinopathy Screening Report", subtitle),
    ]

    meta = [
        ["Eye", report_data.get("eye", "—"), "Report Date", _format_date(report_data.get("generated_at"))],
        ["Image", report_data.get("file_name", "—"), "Quality", f"{pct(report_data.get('image_quality'))} ({report_data.get('quality_label', '—')})"],
    ]
    meta_table = Table(meta, colWidths=[24*mm, 58*mm, 27*mm, 59*mm])
    meta_table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), colors.HexColor("#f3f7fb")),
        ("BOX", (0,0), (-1,-1), .5, colors.HexColor("#d7e2ec")),
        ("INNERGRID", (0,0), (-1,-1), .3, colors.HexColor("#dfe8ef")),
        ("FONTNAME", (0,0), (0,-1), "Helvetica-Bold"),
        ("FONTNAME", (2,0), (2,-1), "Helvetica-Bold"),
        ("TEXTCOLOR", (0,0), (-1,-1), colors.HexColor("#334155")),
        ("FONTSIZE", (0,0), (-1,-1), 8.5),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING", (0,0), (-1,-1), 7),
        ("BOTTOMPADDING", (0,0), (-1,-1), 7),
    ]))
    story += [meta_table, Spacer(1, 8)]

    story.append(Paragraph("Primary Assessment", heading))
    assessment = [
        ["DR Level", f"Level {report_data.get('dr_level', '—')}", "Classification", report_data.get("dr_label", "—")],
        ["Model Confidence", pct(report_data.get("confidence")), "Calibrated", pct(report_data.get("calibrated_confidence"))],
        ["Referral", "Recommended" if report_data.get("refer") else "Not indicated", "Routing", report_data.get("routing", "—")],
    ]
    assessment_table = Table(assessment, colWidths=[31*mm, 48*mm, 32*mm, 57*mm])
    assessment_table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), colors.white),
        ("BOX", (0,0), (-1,-1), .7, colors.HexColor("#cbd9e6")),
        ("INNERGRID", (0,0), (-1,-1), .4, colors.HexColor("#e1e8ef")),
        ("FONTNAME", (0,0), (0,-1), "Helvetica-Bold"),
        ("FONTNAME", (2,0), (2,-1), "Helvetica-Bold"),
        ("FONTSIZE", (0,0), (-1,-1), 9),
        ("TEXTCOLOR", (0,0), (-1,-1), colors.HexColor("#26384e")),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING", (0,0), (-1,-1), 8),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
    ]))
    story += [assessment_table]

    if image_bytes:
        try:
            pil = PILImage.open(BytesIO(image_bytes))
            width, height = pil.size
            max_w, max_h = 78*mm, 58*mm
            scale = min(max_w / width, max_h / height)
            story += [Spacer(1, 8), Paragraph("Screening Image", heading), Image(BytesIO(image_bytes), width=width*scale, height=height*scale)]
        except Exception:
            pass

    story.append(Paragraph("Detected Retinal Findings", heading))
    finding_data = [
        ["Microaneurysms", str(lesions.get("microaneurysms", 0)), "Hemorrhages", str(lesions.get("hemorrhages", 0))],
        ["Hard Exudates", str(lesions.get("hard_exudates", 0)), "Soft Exudates", str(lesions.get("soft_exudates", 0))],
        ["Neovascularization", "Present" if lesions.get("neovascularization") else "Not detected", "—", "—"],
    ]
    finding_table = Table(finding_data, colWidths=[40*mm, 42*mm, 40*mm, 46*mm])
    finding_table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), colors.HexColor("#f8fbfd")),
        ("BOX", (0,0), (-1,-1), .5, colors.HexColor("#d6e2eb")),
        ("INNERGRID", (0,0), (-1,-1), .3, colors.HexColor("#e0e8ef")),
        ("FONTNAME", (0,0), (0,-1), "Helvetica-Bold"),
        ("FONTNAME", (2,0), (2,-1), "Helvetica-Bold"),
        ("FONTSIZE", (0,0), (-1,-1), 8.5),
        ("TOPPADDING", (0,0), (-1,-1), 7),
        ("BOTTOMPADDING", (0,0), (-1,-1), 7),
    ]))
    story.append(finding_table)

    story.append(Paragraph("Clinical Interpretation", heading))
    story.append(Paragraph(report_data.get("clinical_summary", "No clinical summary available."), body))

    story.append(Paragraph("AI Evidence", heading))
    story.append(Paragraph(report_data.get("evidence_statement", "No evidence statement available."), body))

    story.append(Paragraph("Confidence Breakdown", heading))
    confidence_data = [
        ["Image Quality", pct(confidence.get("image_quality")), "Classification", pct(confidence.get("classification"))],
        ["Lesion Detection", pct(confidence.get("lesion_detection")), "Referral Urgency", report_data.get("referral_urgency", "—")],
    ]
    confidence_table = Table(confidence_data, colWidths=[40*mm, 42*mm, 40*mm, 46*mm])
    confidence_table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), colors.HexColor("#f5f9fc")),
        ("BOX", (0,0), (-1,-1), .5, colors.HexColor("#d7e3ec")),
        ("INNERGRID", (0,0), (-1,-1), .3, colors.HexColor("#e0e8ef")),
        ("FONTNAME", (0,0), (0,-1), "Helvetica-Bold"),
        ("FONTNAME", (2,0), (2,-1), "Helvetica-Bold"),
        ("FONTSIZE", (0,0), (-1,-1), 8.5),
        ("TOPPADDING", (0,0), (-1,-1), 7),
        ("BOTTOMPADDING", (0,0), (-1,-1), 7),
    ]))
    story.append(confidence_table)

    story += [Spacer(1, 14), Paragraph(
        "Clinical disclaimer: This report is an AI-assisted screening output intended to support qualified clinical review. It is not a standalone medical diagnosis or a substitute for an ophthalmologist's examination.",
        small,
    )]

    doc.build(story, onFirstPage=_footer, onLaterPages=_footer)
    return buffer.getvalue()


def _format_date(value):
    if not value:
        return "—"
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(timezone.utc).strftime("%d %b %Y, %H:%M UTC")
    except Exception:
        return str(value)


def _footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(colors.HexColor("#64748b"))
    canvas.drawCentredString(A4[0] / 2, 8 * mm, f"SERIX Clinical Screening Report  •  Page {doc.page}")
    canvas.restoreState()
