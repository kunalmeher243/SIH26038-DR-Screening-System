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

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from bson import ObjectId
from collections import defaultdict
from fastapi.security import OAuth2PasswordRequestForm
from typing import Optional

from database import tickets_col, slots_col, messages_col, doctors_col, init_db
from services import (
    iqa_service,
    enhance_service,
    model_service,
    gradcam_service,
    report_service,
    email_service,
    auth_service,
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


# ── Auth Endpoints ────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    role: str

@app.post("/api/auth/register")
async def register(user: UserRegister):
    existing = await users_col.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    user_doc = {
        "name": user.name,
        "email": user.email,
        "password_hash": auth_service.get_password_hash(user.password),
        "role": user.role,
        "created_at": datetime.utcnow()
    }
    result = await users_col.insert_one(user_doc)
    return {"message": "User registered successfully"}

@app.post("/api/auth/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await users_col.find_one({"email": form_data.username})
    if not user or not auth_service.verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
        
    access_token = auth_service.create_access_token(
        data={"sub": str(user["_id"])}
    )
    return {"access_token": access_token, "token_type": "bearer", "role": user["role"], "name": user["name"], "email": user["email"]}

@app.get("/api/auth/me")
async def read_users_me(current_user: dict = Depends(auth_service.get_current_user)):
    return {"name": current_user["name"], "email": current_user["email"], "role": current_user["role"]}


# ── SERIX New Endpoints ────────────────────────────────────────────────────────

@app.get("/api/doctors")
async def get_doctors():
    docs = await doctors_col.find({}, {"_id": 0}).to_list(None)
    return docs

@app.post("/api/tickets")
async def create_ticket(
    patient_name: str = Form(...),
    patient_email: str = Form(...),
    doctor_id: int = Form(...),
    file: UploadFile = File(...)
):
    # 1. Run ML pipeline internally
    report = await report_service.generate(file)
    
    dr_level = report["grading"]["dr_level"]
    dr_label = report["grading"]["dr_label"]
    doc = await doctors_col.find_one({"id": doctor_id})
    doctor_name = doc["name"] if doc else "Unknown Doctor"
    
    # 2. Save ticket to MongoDB
    ticket_doc = {
        "patient_name": patient_name,
        "patient_email": patient_email,
        "doctor_id": doctor_id,
        "doctor_name": doctor_name,
        "image_path": file.filename,
        "dr_level": dr_level,
        "dr_label": dr_label,
        "confidence": report["grading"]["confidence"],
        "gradcam_b64": report.get("gradcam_image_base64", ""),
        "lesion_overlay_b64": report.get("lesion_overlay_image", ""),
        "lesions": {
            "microaneurysms": report.get("lesions", {}).get("microaneurysms", 0),
            "hemorrhages": report.get("lesions", {}).get("hemorrhages", 0),
            "hard_exudates": report.get("lesions", {}).get("hard_exudates", 0),
            "soft_exudates": report.get("lesions", {}).get("soft_exudates", 0),
            "neovascularization": report.get("lesions", {}).get("neovascularization", False)
        },
        "clinical_summary": report.get("clinical_summary", ""),
        "evidence_statement": report.get("evidence_statement", ""),
        "confidence_breakdown": report.get("confidence_breakdown", {}),
        "quality_score": report.get("quality", {}).get("quality_score", 1.0),
        "quality_label": report.get("quality", {}).get("quality_label", "GOOD"),
        "quality_issues": report.get("quality", {}).get("issues", []),
        "enhancement_used": report.get("enhancement", {}).get("was_enhanced", False),
        "refer": report.get("grading", {}).get("refer", False),
        "routing": report.get("grading", {}).get("routing", "STANDARD_REFERRAL"),
        "status": "pending",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await tickets_col.insert_one(ticket_doc)
    ticket_id = str(result.inserted_id)
    
    # 3. Email trigger
    if dr_level >= 2:
        email_service.send_upload_notification(patient_name, patient_email, dr_label)
        
    return {
        "ticket_id": ticket_id,
        "status": "pending",
        "dr_level": dr_level,
        "dr_label": dr_label
    }

def format_doc(doc):
    if doc:
        doc["_id"] = str(doc["_id"])
    return doc

@app.get("/api/tickets/doctor/{doctor_id}")
async def get_doctor_tickets(doctor_id: int):
    cursor = tickets_col.find({"doctor_id": doctor_id}).sort("created_at", -1)
    tickets = [format_doc(doc) async for doc in cursor]
    return tickets

@app.get("/api/tickets/{ticket_id}")
async def get_ticket(ticket_id: str):
    doc = await tickets_col.find_one({"_id": ObjectId(ticket_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return format_doc(doc)

@app.post("/api/tickets/{ticket_id}/accept")
async def accept_ticket(ticket_id: str):
    await tickets_col.update_one(
        {"_id": ObjectId(ticket_id)},
        {"$set": {"status": "accepted", "updated_at": datetime.utcnow()}}
    )
    return {"status": "accepted"}

from pydantic import BaseModel
class ScheduleRequest(BaseModel):
    scheduled_at: str

@app.post("/api/tickets/{ticket_id}/schedule")
async def schedule_ticket(ticket_id: str, req: ScheduleRequest):
    ticket = await tickets_col.find_one({"_id": ObjectId(ticket_id)})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    slot_doc = {
        "ticket_id": ticket_id,
        "doctor_id": ticket["doctor_id"],
        "doctor_name": ticket["doctor_name"],
        "scheduled_at": req.scheduled_at,
        "created_at": datetime.utcnow()
    }
    result = await slots_col.insert_one(slot_doc)
    
    await tickets_col.update_one(
        {"_id": ObjectId(ticket_id)},
        {"$set": {"status": "accepted", "updated_at": datetime.utcnow()}}
    )
    
    email_service.send_schedule_confirmation(
        patient_name=ticket["patient_name"],
        patient_email=ticket["patient_email"],
        phc_email=os.getenv("PHC_WORKER_EMAIL", "phc@yourdomain.com"),
        doctor_name=ticket["doctor_name"],
        scheduled_at=req.scheduled_at
    )
    
    return {
        "slot_id": str(result.inserted_id),
        "scheduled_at": req.scheduled_at,
        "status": "accepted"
    }

@app.get("/api/tickets/patient/me")
async def get_patient_tickets(current_user: dict = Depends(auth_service.get_current_user)):
    if current_user["role"] != "patient":
        raise HTTPException(status_code=403, detail="Not authorized")
    cursor = tickets_col.find({"patient_email": current_user["email"]}).sort("created_at", -1)
    tickets = [format_doc(doc) async for doc in cursor]
    return tickets

@app.get("/api/tickets/{ticket_id}/slot")
async def get_ticket_slot(ticket_id: str):
    doc = await slots_col.find_one({"ticket_id": ticket_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Slot not found")
    return format_doc(doc)

@app.get("/api/chat/{ticket_id}")
async def get_chat_history(ticket_id: str):
    cursor = messages_col.find({"ticket_id": ticket_id}).sort("sent_at", 1)
    messages = [format_doc(doc) async for doc in cursor]
    return messages


# ── WebSockets ─────────────────────────────────────────────────────────────────

class ChatManager:
    def __init__(self):
        self.rooms: dict[str, list[WebSocket]] = defaultdict(list)

    async def connect(self, ticket_id: str, ws: WebSocket):
        await ws.accept()
        self.rooms[ticket_id].append(ws)

    def disconnect(self, ticket_id: str, ws: WebSocket):
        if ws in self.rooms[ticket_id]:
            self.rooms[ticket_id].remove(ws)

    async def broadcast(self, ticket_id: str, message: dict):
        for ws in self.rooms[ticket_id]:
            await ws.send_json(message)

chat_manager = ChatManager()

@app.websocket("/ws/chat/{ticket_id}")
async def websocket_chat(websocket: WebSocket, ticket_id: str):
    await chat_manager.connect(ticket_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            msg = {
                "ticket_id":   ticket_id,
                "sender_role": data.get("sender_role"),
                "sender_name": data.get("sender_name"),
                "content":     data.get("content"),
                "sent_at":     datetime.utcnow().isoformat()
            }
            # Remove _id generated by insert to send cleanly
            result = await messages_col.insert_one(msg)
            msg["_id"] = str(result.inserted_id)
            await chat_manager.broadcast(ticket_id, msg)
    except WebSocketDisconnect:
        chat_manager.disconnect(ticket_id, websocket)


# ── Startup: preload model ────────────────────────────────────────────────────

@app.on_event("startup")
async def startup_event():
    """
    Load model into memory at startup.
    First request is instant — no cold start delay.
    """
    await init_db()
    try:
        model_service.load_model()
        print("[startup] Model loaded successfully.")
    except FileNotFoundError as e:
        print(f"[startup] WARNING: {e}")
        print("[startup] /api/grade and /api/report will fail until model is trained.")
