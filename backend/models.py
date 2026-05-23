from pydantic import BaseModel
from typing import List, Optional


class Message(BaseModel):
    role: str        # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    policy_id: str                         
    symptom: str                           
    history: Optional[List[Message]] = []  


class ChatResponse(BaseModel):
    full_response: str
    specialty: Optional[str]       = None
    copago: Optional[str]          = None
    hospital: Optional[str]        = None
    address: Optional[str]         = None
    phone: Optional[str]           = None
    next_step: Optional[str]       = None
    consultation_id: str
    needs_more_info: Optional[bool]       = False
    recommendations: Optional[List[str]]  = []
    urgency_level: Optional[str]          = "low"