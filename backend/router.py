from fastapi import APIRouter, HTTPException
from models import ChatRequest, ChatResponse
from notion_service import (
    get_policy,
    get_policy_by_cedula,
    get_hospitals,
    save_consultation,
    get_history_by_policy,
    delete_consultation,
)
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

    # 3. Analizar con Gemini
    try:
        result = analyze(policy, hospitals, req.symptom, req.history or [])
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Error en el agente: {str(e)}")

    # 4. Normalizar copago — Gemini a veces devuelve número en lugar de string
    copago_raw = result.get("copago")
    if isinstance(copago_raw, (int, float)):
        copago_str = f"${int(copago_raw)}"
    elif isinstance(copago_raw, str):
        copago_str = copago_raw
    else:
        copago_str = None

    # 5. Guardar en Notion historial
    try:
        copago_num = float(str(copago_str or "0").replace("$", "").strip() or 0)
        consultation_id = save_consultation(
            policy_id=req.policy_id,
            symptom=req.symptom,
            specialty=result.get("specialty") or "General",
            hospital=result.get("hospital") or "",
            copago=copago_num,
            full_response=result.get("full_response") or "",
        )
    except Exception:
        consultation_id = f"LOCAL-{req.policy_id}"

    # 6. Retornar respuesta
    return ChatResponse(
        full_response=result.get("full_response") or "",
        specialty=result.get("specialty"),
        copago=copago_str,
        hospital=result.get("hospital"),
        address=result.get("address"),
        phone=result.get("phone"),
        next_step=result.get("next_step"),
        consultation_id=consultation_id,
        needs_more_info=result.get("needs_more_info", False),
        recommendations=result.get("recommendations") or [],
        urgency_level=result.get("urgency_level") or "low",
    )


@router.get("/policy/{policy_id}")
def get_policy_info(policy_id: str):
    try:
        policy = get_policy(policy_id)
        return {"status": "found", "policy": policy}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/login/{cedula}")
def login(cedula: str):
    try:
        policy = get_policy_by_cedula(cedula)
        return {"status": "found", "policy": policy}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/history/{policy_id}")
def get_history(policy_id: str):
    try:
        history = get_history_by_policy(policy_id)
        return {"status": "ok", "history": history, "total": len(history)}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Error consultando historial: {str(e)}")


@router.delete("/history/{consultation_id}")
def delete_history_item(consultation_id: str):
    """Elimina una consulta específica del historial en Notion."""
    try:
        delete_consultation(consultation_id)
        return {"status": "deleted", "consultation_id": consultation_id}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Error eliminando consulta: {str(e)}")