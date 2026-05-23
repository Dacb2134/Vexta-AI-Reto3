import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from router import router

load_dotenv()
print("NOTION KEY:", os.getenv("NOTION_API_KEY"))
origins = os.getenv("CORS_ORIGINS", "*").split(",")
print("CORS ORIGINS:", origins)  # ← agregar esta línea
app = FastAPI(
    title="PulseAI — Estimador de Copago y Cobertura",
    description="Agente conversacional que cruza síntomas con pólizas para recomendar especialidad, copago y hospital.",
    version="1.0.0",
)

origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.get("/health")
def health():
    return {"status": "ok", "version": "1.0.0", "agent": "PulseAI"}
