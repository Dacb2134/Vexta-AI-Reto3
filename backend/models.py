from pydantic import BaseModel
from typing import List, Optional


class Message(BaseModel):
    role: str        # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    policy_id: str                        # Ej: POL-2024-001
    symptom: str                          # Lo que escribe el paciente
    history: Optional[List[Message]] = [] # Historial de la conversación


class ChatResponse(BaseModel):
    full_response: str           # Respuesta en lenguaje natural
    specialty: Optional[str]     # Cardiología, Traumatología, etc.
    copago: Optional[str]        # "$45"
    hospital: Optional[str]      # Hospital Metropolitano
    address: Optional[str]       # Dirección del hospital
    phone: Optional[str]         # Teléfono
    next_step: Optional[str]     # Acción recomendada
    consultation_id: str         # ID guardado en Notion
