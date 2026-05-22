from fastapi import APIRouter, HTTPException
from models import ChatRequest, ChatResponse
from notion_service import get_policy, get_hospitals, save_consultation
from agent import analyze

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    # 1. Leer póliza desde Notion
    try:
        policy = get_policy(req.policy_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Error consultando Notion: {str(e)}")

    if policy["estado"] != "Activa":
        raise HTTPException(status_code=400, detail="La póliza no está activa.")

    # 2. Leer hospitales disponibles para el plan
    try:
        hospitals = get_hospitals(plan=policy["plan"])
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Error leyendo hospitales: {str(e)}")

    # 3. Analizar con Claude
    try:
        result = analyze(policy, hospitals, req.symptom, req.history or [])
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Error en el agente: {str(e)}")

    # 4. Guardar en Notion historial
    try:
        consultation_id = save_consultation(
            policy_id=req.policy_id,
            symptom=req.symptom,
            specialty=result.get("specialty", "General"),
            hospital=result.get("hospital", ""),
            copago=float(result.get("copago", "$0").replace("$", "") or 0),
            full_response=result.get("full_response", ""),
        )
    except Exception:
        consultation_id = f"LOCAL-{req.policy_id}"

    return ChatResponse(
        full_response=result.get("full_response", ""),
        specialty=result.get("specialty"),
        copago=result.get("copago"),
        hospital=result.get("hospital"),
        address=result.get("address"),
        phone=result.get("phone"),
        next_step=result.get("next_step"),
        consultation_id=consultation_id,
    )


@router.get("/policy/{policy_id}")
def get_policy_info(policy_id: str):
    try:
        policy = get_policy(policy_id)
        return {"status": "found", "policy": policy}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
