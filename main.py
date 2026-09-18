"""
main.py
FastAPI entry point for DR Screening System — Team SERIX.

RUN:
    uvicorn main:app --reload --port 8000

ENDPOINTS:
    POST /api/quality   → Image quality assessment
    POST /api/enhance   → CLAHE enhancement
    POST /api/grade     → DR severity grading
    POST /api/gradcam   → Grad-CAM explanation overlay
    POST /api/report    → Full clinical report (runs full pipeline)
    POST /api/report/pdf → Downloadable clinical report PDF

    GET  /health        → Health check
    GET  /docs          → Swagger UI (auto-generated)
"""

import os
from fastapi.responses import Response

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from services import (
    iqa_service,
    enhance_service,
    model_service,
    gradcam_service,
    report_service,
)

app = FastAPI(
    title="DR Screening System — Team SERIX",
    description="SIH 2026 | PS SIH26038 | Explainable AI for Diabetic Retinopathy",
    version="1.0.0",
)

# ── CORS — configure the web app origin for local or LAN deployment ───────────
cors_origins = [
    origin.strip()
    for origin in os.getenv(
        "SERIX_CORS_ORIGINS",
        "http://localhost:5173,http://localhost:3000",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "team": "SERIX", "ps": "SIH26038"}


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.post("/api/quality")
async def assess_quality(file: UploadFile = File(...)):
    """
    Stage 1: Image Quality Assessment.
    Returns gradable/borderline/ungradable classification.
    Pipeline stops here if image is ungradable.
    """
    return await iqa_service.assess(file)


@app.post("/api/enhance")
async def enhance_image(file: UploadFile = File(...)):
    """
    Stage 2: Adaptive Enhancement.
    Returns original + CLAHE-enhanced image as base64 PNGs.
    """
    return await enhance_service.enhance(file)


@app.post("/api/grade")
async def grade_image(file: UploadFile = File(...)):
    """
    Stage 3: DR Severity Grading.
    Returns DR level 0-4, calibrated confidence, referral decision, routing.
    Requires: models/calibrated_model.pt (run train + calibrate first).
    """
    return await model_service.grade(file)


@app.post("/api/gradcam")
async def generate_gradcam(file: UploadFile = File(...)):
    """Generate a browser-ready Grad-CAM overlay for a retinal image."""
    return await gradcam_service.generate(file)


@app.post("/api/report")
async def generate_report(file: UploadFile = File(...)):
    """
    Stage 4: Full Clinical Report.
    Runs complete pipeline internally: IQA → Grade → Grad-CAM → Lesions → Report.
    SLA: must return within 30 seconds.
    """
    return await report_service.generate(file)


@app.post("/api/report/pdf")
async def generate_report_pdf(file: UploadFile = File(...)):
    """Generate the clinical report and return it as a downloadable PDF."""
    report = await report_service.generate(file)
    pdf_bytes = report_service.report_to_pdf(report)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="serix-report.pdf"'},
    )


# ── Startup: preload model ────────────────────────────────────────────────────

@app.on_event("startup")
async def startup_event():
    """
    Load model into memory at startup.
    First request is instant — no cold start delay.
    """
    try:
        model_service.load_model()
        print("[startup] Model loaded successfully.")
    except FileNotFoundError as e:
        print(f"[startup] WARNING: {e}")
        print("[startup] /api/grade and /api/report will fail until model is trained.")
