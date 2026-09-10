from io import BytesIO
from datetime import datetime
from html import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image,
    PageBreak,
    KeepTogether,
)
from PIL import Image as PILImage


# ---------------------------------------------------------------------------
# RetinaTrack.AI clinical report PDF
#
# This PDF intentionally mirrors the structure and terminology of the
# ClinicalReport.jsx preview:
#   Header -> title/primary assessment -> screening information ->
#   assessment -> retinal image -> findings -> interpretation ->
#   AI evidence -> referral -> anatomy -> sign-off -> disclaimer.
# ---------------------------------------------------------------------------

PAGE_W, PAGE_H = A4

NAVY = colors.HexColor("#172d47")
TEXT = colors.HexColor("#263b53")
MUTED = colors.HexColor("#71869d")
LIGHT_MUTED = colors.HexColor("#8295a8")
BLUE = colors.HexColor("#2875dc")
BLUE_DARK = colors.HexColor("#236eb6")
LINE = colors.HexColor("#dbe3ea")
LIGHT_LINE = colors.HexColor("#e5ebf0")
PANEL = colors.HexColor("#f2f6f9")
IMAGE_BG = colors.HexColor("#f6f8fa")


def build_clinical_report_pdf(
    report_data: dict,
    image_bytes: bytes | None = None,
) -> bytes:
    report_data = report_data or {}

    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=15.5 * mm,
        leftMargin=15.5 * mm,
        topMargin=13 * mm,
        bottomMargin=15 * mm,
        title=report_data.get(
            "report_title",
            "RetinaTrack Clinical Screening Report",
        ),
        author="RetinaTrack.AI Intelligent Fundus Screening",
        subject="AI-assisted diabetic retinopathy screening report",
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "ClinicalTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=21,
        leading=24,
        textColor=NAVY,
        spaceAfter=5,
    )

    subtitle_style = ParagraphStyle(
        "ClinicalSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=12,
        textColor=MUTED,
        spaceAfter=0,
    )

    kicker_style = ParagraphStyle(
        "ClinicalKicker",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=6.5,
        leading=8,
        textColor=colors.HexColor("#3678ad"),
        spaceAfter=4,
    )

    report_heading_style = ParagraphStyle(
        "ReportHeading",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9.5,
        leading=12,
        textColor=TEXT,
        spaceBefore=0,
        spaceAfter=7,
    )

    body_style = ParagraphStyle(
        "ReportBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.3,
        leading=12.5,
        textColor=TEXT,
        spaceAfter=0,
    )

    small_style = ParagraphStyle(
        "ReportSmall",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=6.8,
        leading=9.2,
        textColor=LIGHT_MUTED,
    )

    tiny_style = ParagraphStyle(
        "ReportTiny",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=6.2,
        leading=8,
        textColor=MUTED,
    )

    table_label_style = ParagraphStyle(
        "TableLabel",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=6.2,
        leading=8,
        textColor=colors.HexColor("#8498ab"),
    )

    table_value_style = ParagraphStyle(
        "TableValue",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=7.6,
        leading=10,
        textColor=colors.HexColor("#2a4059"),
    )

    table_value_bold_style = ParagraphStyle(
        "TableValueBold",
        parent=table_value_style,
        fontName="Helvetica-Bold",
    )

    def clean(value, fallback="—"):
        if value is None or value == "":
            return fallback
        return escape(str(value))

    def pct(value):
        try:
            number = float(value)
            return f"{round(number * 100):.0f}%"
        except (TypeError, ValueError):
            return "—"

    def format_date(value):
        if not value:
            return "—"
        try:
            parsed = datetime.fromisoformat(
                str(value).replace("Z", "+00:00")
            )
            # The browser preview uses en-IN/local time. The deployment is
            # expected to be in the same local timezone, so preserve the
            # supplied timestamp's local representation when possible.
            return parsed.strftime("%d %b %Y, %I:%M %p")
        except Exception:
            return clean(value)

    def severity_values():
        try:
            level = int(float(report_data.get("dr_level")))
        except (TypeError, ValueError):
            level = None

        if level == 0:
            return (
                "Normal",
                colors.HexColor("#16834f"),
                colors.HexColor("#effaf4"),
                colors.HexColor("#b8e6cd"),
            )
        if level == 1:
            return (
                "Mild Non-Proliferative DR",
                colors.HexColor("#16834f"),
                colors.HexColor("#effaf4"),
                colors.HexColor("#b8e6cd"),
            )
        if level == 2:
            return (
                "Moderate Non-Proliferative DR",
                colors.HexColor("#a16207"),
                colors.HexColor("#fff9e8"),
                colors.HexColor("#f2d58a"),
            )
        if level in (3, 4):
            return (
                "Proliferative DR"
                if level == 4
                else "Severe Non-Proliferative DR",
                colors.HexColor("#b42318"),
                colors.HexColor("#fff1f1"),
                colors.HexColor("#f3b6b6"),
            )

        return (
            clean(report_data.get("dr_label"), "Assessment unavailable"),
            colors.HexColor("#a16207"),
            colors.HexColor("#fff9e8"),
            colors.HexColor("#f2d58a"),
        )

    dr_label, severity_color, severity_bg, severity_border = severity_values()

    lesions = report_data.get("lesions") or {}
    anatomy = report_data.get("anatomy") or {}
    confidence = report_data.get("confidence_breakdown") or {}

    report_id = clean(report_data.get("report_id"), "RT-—")
    if not report_id.startswith("RT-"):
        report_id = f"RT-{report_id}"

    generated_at = format_date(report_data.get("generated_at"))
    eye = clean(report_data.get("eye"))
    file_name = clean(report_data.get("file_name"), "retinal-image")
    quality = (
        f"{pct(report_data.get('image_quality'))} — "
        f"{clean(report_data.get('quality_label'), 'GRADABLE')}"
    )

    story = []

    # -----------------------------------------------------------------------
    # PAGE 1 — HEADER / ASSESSMENT / IMAGE
    # -----------------------------------------------------------------------

    brand_logo = Table(
        [[
            Paragraph(
                "<font color='#ffffff'><b>◎</b></font>",
                ParagraphStyle(
                    "Logo",
                    parent=styles["Normal"],
                    fontSize=16,
                    leading=18,
                    alignment=TA_CENTER,
                ),
            ),
            [
                Paragraph(
                    "RetinaTrack<span color='#2875dc'>.AI</span>",
                    ParagraphStyle(
                        "Brand",
                        parent=styles["Normal"],
                        fontName="Helvetica-Bold",
                        fontSize=14,
                        leading=15,
                        textColor=NAVY,
                    ),
                ),
                Paragraph(
                    "Intelligent Fundus Screening",
                    ParagraphStyle(
                        "BrandSub",
                        parent=styles["Normal"],
                        fontSize=5.8,
                        leading=7,
                        textColor=colors.HexColor("#7990a8"),
                    ),
                ),
            ],
        ]],
        colWidths=[11 * mm, 72 * mm],
    )
    brand_logo.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (0, 0),
                    colors.HexColor("#2167d8"),
                ),
                ("BOX", (0, 0), (0, 0), 0, colors.white),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (0, 0), 0),
                ("RIGHTPADDING", (0, 0), (0, 0), 0),
                ("TOPPADDING", (0, 0), (0, 0), 0),
                ("BOTTOMPADDING", (0, 0), (0, 0), 0),
                ("LEFTPADDING", (1, 0), (1, 0), 3),
                ("RIGHTPADDING", (1, 0), (1, 0), 0),
                ("TOPPADDING", (1, 0), (1, 0), 0),
                ("BOTTOMPADDING", (1, 0), (1, 0), 0),
            ]
        )
    )

    header_meta = [
        Paragraph(
            "CLINICAL SCREENING REPORT",
            ParagraphStyle(
                "MetaKicker",
                parent=styles["Normal"],
                fontName="Helvetica-Bold",
                fontSize=6.5,
                leading=8,
                textColor=BLUE_DARK,
            ),
        ),
        Paragraph(
            f"Report ID: {report_id}",
            tiny_style,
        ),
        Paragraph(
            generated_at,
            tiny_style,
        ),
    ]

    header = Table(
        [[brand_logo, header_meta]],
        colWidths=[95 * mm, 77 * mm],
    )
    header.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ALIGN", (1, 0), (1, 0), "RIGHT"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )
    story.append(header)
    story.append(Spacer(1, 7 * mm))

    story.append(
        Table(
            [[""]],
            colWidths=[172 * mm],
            rowHeights=[0.35 * mm],
            style=TableStyle(
                [
                    (
                        "BACKGROUND",
                        (0, 0),
                        (-1, -1),
                        LINE,
                    ),
                    ("LEFTPADDING", (0, 0), (-1, -1), 0),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                    ("TOPPADDING", (0, 0), (-1, -1), 0),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
                ]
            ),
        )
    )
    story.append(Spacer(1, 6 * mm))

    title_left = [
        Paragraph("DIABETIC RETINOPATHY SCREENING", kicker_style),
        Paragraph("Retinal Image Assessment", title_style),
        Paragraph(
            "AI-assisted retinal screening assessment for clinician review.",
            subtitle_style,
        ),
    ]

    severity_box = Table(
        [
            [
                Paragraph(
                    "PRIMARY ASSESSMENT",
                    ParagraphStyle(
                        "SeveritySmall",
                        parent=styles["Normal"],
                        fontName="Helvetica-Bold",
                        fontSize=5.8,
                        leading=7,
                        textColor=severity_color,
                    ),
                )
            ],
            [
                Paragraph(
                    clean(dr_label),
                    ParagraphStyle(
                        "SeverityMain",
                        parent=styles["Normal"],
                        fontName="Helvetica-Bold",
                        fontSize=9.8,
                        leading=12,
                        textColor=severity_color,
                    ),
                )
            ],
            [
                Paragraph(
                    f"DR Level {clean(report_data.get('dr_level'))}",
                    ParagraphStyle(
                        "SeverityLevel",
                        parent=styles["Normal"],
                        fontSize=6.8,
                        leading=8,
                        textColor=severity_color,
                    ),
                )
            ],
        ],
        colWidths=[46 * mm],
    )
    severity_box.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), severity_bg),
                ("BOX", (0, 0), (-1, -1), 0.7, severity_border),
                ("LEFTPADDING", (0, 0), (-1, -1), 4 * mm),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4 * mm),
                ("TOPPADDING", (0, 0), (-1, -1), 2.5 * mm),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2.5 * mm),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ]
        )
    )

    title_table = Table(
        [[title_left, severity_box]],
        colWidths=[122 * mm, 50 * mm],
    )
    title_table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )
    story.append(title_table)
    story.append(Spacer(1, 7 * mm))

    # Section helper
    def section_heading(number, text):
        return Table(
            [[
                Paragraph(
                    number,
                    ParagraphStyle(
                        "SectionNumber",
                        parent=styles["Normal"],
                        fontName="Helvetica-Bold",
                        fontSize=6.4,
                        leading=8,
                        textColor=BLUE,
                    ),
                ),
                Paragraph(text, report_heading_style),
            ]],
            colWidths=[9 * mm, 163 * mm],
            style=TableStyle(
                [
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                    (
                        "LINEBELOW",
                        (0, 0),
                        (-1, -1),
                        0.5,
                        LIGHT_LINE,
                    ),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 2.5 * mm),
                    ("LEFTPADDING", (0, 0), (-1, -1), 0),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                    ("TOPPADDING", (0, 0), (-1, -1), 0),
                ]
            ),
        )

    # 01 Screening information
    story.append(section_heading("01", "Screening Information"))
    info_data = [
        [
            Paragraph("EYE", table_label_style),
            Paragraph("IMAGE FILE", table_label_style),
        ],
        [
            Paragraph(eye, table_value_bold_style),
            Paragraph(file_name, table_value_bold_style),
        ],
        [
            Paragraph("IMAGE QUALITY", table_label_style),
            Paragraph("ASSESSMENT TYPE", table_label_style),
        ],
        [
            Paragraph(quality, table_value_bold_style),
            Paragraph("AI-assisted screening", table_value_bold_style),
        ],
    ]
    info_table = Table(info_data, colWidths=[86 * mm, 86 * mm])
    info_table.setStyle(
        TableStyle(
            [
                ("BOX", (0, 0), (-1, -1), 0.55, colors.HexColor("#dfe7ed")),
                ("INNERGRID", (0, 0), (-1, -1), 0.45, LIGHT_LINE),
                ("BACKGROUND", (0, 0), (-1, -1), colors.white),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 3.5 * mm),
                ("RIGHTPADDING", (0, 0), (-1, -1), 3.5 * mm),
                ("TOPPADDING", (0, 0), (-1, -1), 2.4 * mm),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2.4 * mm),
            ]
        )
    )
    story.append(info_table)
    story.append(Spacer(1, 6 * mm))

    # 02 Primary assessment
    story.append(section_heading("02", "Primary Assessment"))

    assessment = Table(
        [[
            [
                Paragraph(
                    "DIABETIC RETINOPATHY CLASSIFICATION",
                    table_label_style,
                ),
                Spacer(1, 1.5 * mm),
                Paragraph(
                    clean(dr_label),
                    ParagraphStyle(
                        "AssessmentLabel",
                        parent=styles["Normal"],
                        fontName="Helvetica-Bold",
                        fontSize=10.5,
                        leading=13,
                        textColor=severity_color,
                    ),
                ),
            ],
            [
                Paragraph(
                    "MODEL CONFIDENCE",
                    table_label_style,
                ),
                Spacer(1, 1.5 * mm),
                Paragraph(
                    pct(report_data.get("confidence")),
                    ParagraphStyle(
                        "ConfidenceBig",
                        parent=styles["Normal"],
                        fontName="Helvetica-Bold",
                        fontSize=19,
                        leading=20,
                        textColor=severity_color,
                    ),
                ),
                Paragraph(
                    f"Calibrated {pct(report_data.get('calibrated_confidence'))}",
                    tiny_style,
                ),
            ],
        ]],
        colWidths=[124 * mm, 48 * mm],
    )
    assessment.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), severity_bg),
                ("BOX", (0, 0), (-1, -1), 0.7, severity_border),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 4 * mm),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4 * mm),
                ("TOPPADDING", (0, 0), (-1, -1), 3.5 * mm),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3.5 * mm),
                ("ALIGN", (1, 0), (1, 0), "RIGHT"),
            ]
        )
    )
    story.append(assessment)
    story.append(Spacer(1, 6 * mm))

    # 03 Examined retinal image
    if image_bytes:
        try:
            pil = PILImage.open(BytesIO(image_bytes))
            width, height = pil.size

            max_width = 150 * mm
            max_height = 72 * mm
            scale = min(
                max_width / max(width, 1),
                max_height / max(height, 1),
            )

            image = Image(
                BytesIO(image_bytes),
                width=max(1, width * scale),
                height=max(1, height * scale),
            )

            image_table = Table(
                [[image]],
                colWidths=[172 * mm],
            )
            image_table.setStyle(
                TableStyle(
                    [
                        ("BOX", (0, 0), (-1, -1), 0.55, colors.HexColor("#dfe6ec")),
                        ("BACKGROUND", (0, 0), (-1, -1), IMAGE_BG),
                        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                        ("LEFTPADDING", (0, 0), (-1, -1), 3 * mm),
                        ("RIGHTPADDING", (0, 0), (-1, -1), 3 * mm),
                        ("TOPPADDING", (0, 0), (-1, -1), 3 * mm),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
                    ]
                )
            )

            story.append(section_heading("03", "Examined Retinal Image"))
            story.append(image_table)

            caption = Table(
                [[
                    Paragraph(eye, tiny_style),
                    Paragraph(file_name, tiny_style),
                ]],
                colWidths=[86 * mm, 86 * mm],
            )
            caption.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, -1), IMAGE_BG),
                        ("BOX", (0, 0), (-1, -1), 0.55, colors.HexColor("#dfe6ec")),
                        ("TOPPADDING", (0, 0), (-1, -1), 2 * mm),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 2 * mm),
                        ("LEFTPADDING", (0, 0), (-1, -1), 3 * mm),
                        ("RIGHTPADDING", (0, 0), (-1, -1), 3 * mm),
                    ]
                )
            )
            story.append(caption)
        except Exception:
            pass

    # Force the remaining clinical detail onto page 2, matching the
    # long-form preview rather than producing a mostly blank second page.
    story.append(PageBreak())

    # -----------------------------------------------------------------------
    # PAGE 2 — FINDINGS / INTERPRETATION / EVIDENCE / REFERRAL / ANATOMY
    # -----------------------------------------------------------------------

    story.append(
        Paragraph(
            "RetinaTrack<span color='#2875dc'>.AI</span>",
            ParagraphStyle(
                "Page2Brand",
                parent=styles["Normal"],
                fontName="Helvetica-Bold",
                fontSize=10.5,
                leading=12,
                textColor=NAVY,
            ),
        )
    )
    story.append(
        Paragraph(
            f"{report_id}  •  {generated_at}",
            tiny_style,
        )
    )
    story.append(Spacer(1, 4 * mm))

    # 04 Findings
    story.append(section_heading("04", "Detected Retinal Findings"))

    finding_rows = [
        [
            Paragraph("Finding", table_label_style),
            Paragraph("Detected Count", table_label_style),
            Paragraph("Assessment", table_label_style),
        ],
        [
            Paragraph("Microaneurysms", table_value_style),
            Paragraph(str(lesions.get("microaneurysms", 0)), table_value_bold_style),
            Paragraph("Detected" if lesions.get("microaneurysms", 0) else "Not detected", table_value_style),
        ],
        [
            Paragraph("Hemorrhages", table_value_style),
            Paragraph(str(lesions.get("hemorrhages", 0)), table_value_bold_style),
            Paragraph("Detected" if lesions.get("hemorrhages", 0) else "Not detected", table_value_style),
        ],
        [
            Paragraph("Hard Exudates", table_value_style),
            Paragraph(str(lesions.get("hard_exudates", 0)), table_value_bold_style),
            Paragraph("Detected" if lesions.get("hard_exudates", 0) else "Not detected", table_value_style),
        ],
        [
            Paragraph("Soft Exudates", table_value_style),
            Paragraph(str(lesions.get("soft_exudates", 0)), table_value_bold_style),
            Paragraph("Detected" if lesions.get("soft_exudates", 0) else "Not detected", table_value_style),
        ],
        [
            Paragraph("Neovascularization", table_value_style),
            Paragraph(
                "Present" if lesions.get("neovascularization") else "Not detected",
                table_value_bold_style,
            ),
            Paragraph(
                "Requires clinical correlation"
                if lesions.get("neovascularization")
                else "No neovascularization detected",
                table_value_style,
            ),
        ],
    ]

    findings_table = Table(
        finding_rows,
        colWidths=[65 * mm, 40 * mm, 67 * mm],
        repeatRows=1,
    )
    findings_table.setStyle(
        TableStyle(
            [
                ("BOX", (0, 0), (-1, -1), 0.55, colors.HexColor("#dfe6ec")),
                ("INNERGRID", (0, 0), (-1, -1), 0.4, LIGHT_LINE),
                ("BACKGROUND", (0, 0), (-1, 0), PANEL),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 3 * mm),
                ("RIGHTPADDING", (0, 0), (-1, -1), 3 * mm),
                ("TOPPADDING", (0, 0), (-1, -1), 2.3 * mm),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2.3 * mm),
            ]
        )
    )
    story.append(findings_table)
    story.append(Spacer(1, 5 * mm))

    # 05 Clinical interpretation
    story.append(section_heading("05", "Clinical Interpretation"))
    clinical_summary = clean(
        report_data.get("clinical_summary"),
        "No clinical summary available.",
    )
    interpretation_box = Table(
        [[Paragraph(clinical_summary, body_style)]],
        colWidths=[172 * mm],
    )
    interpretation_box.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.white),
                ("BOX", (0, 0), (-1, -1), 0.55, colors.HexColor("#dfe6ec")),
                ("LEFTPADDING", (0, 0), (-1, -1), 4 * mm),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4 * mm),
                ("TOPPADDING", (0, 0), (-1, -1), 3 * mm),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3 * mm),
            ]
        )
    )
    story.append(interpretation_box)
    story.append(Spacer(1, 5 * mm))

    # 06 AI Evidence
    story.append(section_heading("06", "AI Evidence"))
    evidence = clean(
        report_data.get("evidence_statement"),
        "No evidence statement available.",
    )
    story.append(
        Table(
            [[Paragraph(evidence, body_style)]],
            colWidths=[172 * mm],
            style=TableStyle(
                [
                    ("BOX", (0, 0), (-1, -1), 0.55, colors.HexColor("#dfe6ec")),
                    ("BACKGROUND", (0, 0), (-1, -1), colors.white),
                    ("LEFTPADDING", (0, 0), (-1, -1), 4 * mm),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 4 * mm),
                    ("TOPPADDING", (0, 0), (-1, -1), 3 * mm),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 3 * mm),
                ]
            ),
        )
    )
    story.append(Spacer(1, 3.5 * mm))

    confidence_rows = [
        [
            Paragraph("IMAGE QUALITY", table_label_style),
            Paragraph("CLASSIFICATION", table_label_style),
            Paragraph("LESION DETECTION", table_label_style),
        ],
        [
            Paragraph(pct(confidence.get("image_quality")), table_value_bold_style),
            Paragraph(pct(confidence.get("classification")), table_value_bold_style),
            Paragraph(pct(confidence.get("lesion_detection")), table_value_bold_style),
        ],
    ]
    confidence_table = Table(
        confidence_rows,
        colWidths=[57.3 * mm, 57.3 * mm, 57.4 * mm],
    )
    confidence_table.setStyle(
        TableStyle(
            [
                ("BOX", (0, 0), (-1, -1), 0.55, colors.HexColor("#dfe6ec")),
                ("INNERGRID", (0, 0), (-1, -1), 0.4, LIGHT_LINE),
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fbfd")),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 3 * mm),
                ("RIGHTPADDING", (0, 0), (-1, -1), 3 * mm),
                ("TOPPADDING", (0, 0), (-1, -1), 2.2 * mm),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2.2 * mm),
            ]
        )
    )
    story.append(confidence_table)
    story.append(Spacer(1, 5 * mm))

    # 07 Referral
    story.append(section_heading("07", "Referral Recommendation"))
    referral_text = (
        "Referral Recommended"
        if report_data.get("refer")
        else "Referral Not Indicated"
    )
    referral = Table(
        [[
            Paragraph(
                "!",
                ParagraphStyle(
                    "ReferralIcon",
                    parent=styles["Normal"],
                    fontName="Helvetica-Bold",
                    fontSize=11,
                    leading=13,
                    alignment=TA_CENTER,
                    textColor=colors.white,
                ),
            ),
            [
                Paragraph(
                    referral_text,
                    ParagraphStyle(
                        "ReferralTitle",
                        parent=styles["Normal"],
                        fontName="Helvetica-Bold",
                        fontSize=9,
                        leading=11,
                        textColor=severity_color,
                    ),
                ),
                Paragraph(
                    f"Routing: {clean(report_data.get('routing'))}",
                    body_style,
                ),
                Paragraph(
                    f"Urgency: {clean(report_data.get('referral_urgency'))}",
                    body_style,
                ),
            ],
        ]],
        colWidths=[12 * mm, 160 * mm],
    )
    referral.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), severity_bg),
                ("BOX", (0, 0), (-1, -1), 0.7, severity_border),
                ("BACKGROUND", (0, 0), (0, 0), severity_color),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("ALIGN", (0, 0), (0, 0), "CENTER"),
                ("LEFTPADDING", (0, 0), (-1, -1), 3 * mm),
                ("RIGHTPADDING", (0, 0), (-1, -1), 3 * mm),
                ("TOPPADDING", (0, 0), (-1, -1), 2.5 * mm),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2.5 * mm),
            ]
        )
    )
    story.append(referral)
    story.append(Spacer(1, 5 * mm))

    # 08 Anatomy
    story.append(section_heading("08", "Anatomical Assessment"))

    def anatomy_value(value):
        return "Detected" if value else "Not detected"

    anatomy_table = Table(
        [[
            Paragraph("Optic Disc", table_value_bold_style),
            Paragraph(
                anatomy_value(anatomy.get("optic_disc_detected")),
                table_value_style,
            ),
            Paragraph("Fovea", table_value_bold_style),
            Paragraph(
                anatomy_value(anatomy.get("fovea_detected")),
                table_value_style,
            ),
        ]],
        colWidths=[43 * mm, 43 * mm, 43 * mm, 43 * mm],
    )
    anatomy_table.setStyle(
        TableStyle(
            [
                ("BOX", (0, 0), (-1, -1), 0.55, colors.HexColor("#dfe6ec")),
                ("INNERGRID", (0, 0), (-1, -1), 0.4, LIGHT_LINE),
                ("BACKGROUND", (0, 0), (-1, -1), colors.white),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 3 * mm),
                ("RIGHTPADDING", (0, 0), (-1, -1), 3 * mm),
                ("TOPPADDING", (0, 0), (-1, -1), 2.5 * mm),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2.5 * mm),
            ]
        )
    )
    story.append(anatomy_table)
    story.append(Spacer(1, 7 * mm))

    # Sign-off
    signoff = Table(
        [[
            [
                Paragraph(
                    "AI Screening Assessment",
                    ParagraphStyle(
                        "SignoffTitle",
                        parent=styles["Normal"],
                        fontName="Helvetica-Bold",
                        fontSize=8.2,
                        leading=10,
                        textColor=TEXT,
                    ),
                ),
                Paragraph(
                    "Generated by RetinaTrack.AI screening system.",
                    tiny_style,
                ),
            ],
            [
                Paragraph(
                    "Clinician Review",
                    tiny_style,
                ),
                Spacer(1, 7 * mm),
                Paragraph(
                    "Signature / Date",
                    tiny_style,
                ),
            ],
        ]],
        colWidths=[100 * mm, 72 * mm],
    )
    signoff.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "BOTTOM"),
                ("LINEABOVE", (1, 0), (1, 0), 0.5, colors.HexColor("#9aabba")),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )
    story.append(signoff)
    story.append(Spacer(1, 5 * mm))

    # Disclaimer
    disclaimer = Table(
        [[
            Paragraph(
                "<b>IMPORTANT CLINICAL NOTICE</b><br/>"
                "This report is an AI-assisted screening aid and is not a "
                "definitive medical diagnosis. Results should be reviewed "
                "and clinically validated by a qualified healthcare "
                "professional before making patient-management decisions.",
                ParagraphStyle(
                    "Disclaimer",
                    parent=styles["Normal"],
                    fontName="Helvetica",
                    fontSize=6.5,
                    leading=9.2,
                    textColor=colors.HexColor("#5f7183"),
                ),
            )
        ]],
        colWidths=[172 * mm],
    )
    disclaimer.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f5f8fa")),
                ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#d9e2e9")),
                ("LEFTPADDING", (0, 0), (-1, -1), 3.5 * mm),
                ("RIGHTPADDING", (0, 0), (-1, -1), 3.5 * mm),
                ("TOPPADDING", (0, 0), (-1, -1), 2.5 * mm),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2.5 * mm),
            ]
        )
    )
    story.append(disclaimer)

    doc.build(
        story,
        onFirstPage=_draw_footer,
        onLaterPages=_draw_footer,
    )

    return buffer.getvalue()


def _draw_footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor("#dbe3ea"))
    canvas.setLineWidth(0.4)
    canvas.line(
        15.5 * mm,
        10.5 * mm,
        PAGE_W - 15.5 * mm,
        10.5 * mm,
    )

    canvas.setFont("Helvetica", 6.5)
    canvas.setFillColor(colors.HexColor("#8295a8"))

    canvas.drawString(
        15.5 * mm,
        6.5 * mm,
        "RetinaTrack.AI",
    )

    canvas.drawCentredString(
        PAGE_W / 2,
        6.5 * mm,
        "Confidential Clinical Document",
    )

    canvas.drawRightString(
        PAGE_W - 15.5 * mm,
        6.5 * mm,
        f"Page {doc.page}",
    )

    canvas.restoreState()
