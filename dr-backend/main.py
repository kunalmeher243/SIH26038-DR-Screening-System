from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import quality, enhance, grade, report, whatsapp

app = FastAPI(
    title="DR Screening API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    quality.router,
    prefix="/api"
)

app.include_router(
    enhance.router,
    prefix="/api"
)

app.include_router(
    grade.router,
    prefix="/api"
)

app.include_router(
    report.router,
    prefix="/api"
)

app.include_router(
    whatsapp.router,
    prefix="/api"
)


@app.get("/")
async def root():
    return {
        "message": "DR Screening API is running"
    }
