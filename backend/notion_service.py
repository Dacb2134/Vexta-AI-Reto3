import os
from datetime import datetime
from notion_client import Client

notion = Client(auth=os.getenv("NOTION_API_KEY"))

POLICIES_DB   = os.getenv("NOTION_POLICIES_DB_ID")
HOSPITALS_DB  = os.getenv("NOTION_HOSPITALS_DB_ID")
HISTORY_DB    = os.getenv("NOTION_HISTORY_DB_ID")


# ── HELPERS ──────────────────────────────────────────────────────

def _text(props, key):
    items = props.get(key, {}).get("rich_text", [])
    return items[0]["text"]["content"] if items else ""

def _title(props, key):
    items = props.get(key, {}).get("title", [])
    return items[0]["text"]["content"] if items else ""

def _select(props, key):
    sel = props.get(key, {}).get("select")
    return sel["name"] if sel else ""

def _multi(props, key):
    items = props.get(key, {}).get("multi_select", [])
    return [i["name"] for i in items]

def _number(props, key):
    return props.get(key, {}).get("number", 0)

def _date(props, key):
    d = props.get(key, {}).get("date")
    return d["start"] if d else ""


# ── LEER PÓLIZA ──────────────────────────────────────────────────

def get_policy(policy_id: str) -> dict:
    results = notion.databases.query(
        database_id=POLICIES_DB,
        filter={"property": "ID Póliza", "title": {"equals": policy_id}}
    )
    if not results["results"]:
        raise ValueError(f"Póliza '{policy_id}' no encontrada.")

    p = results["results"][0]["properties"]
    return {
        "id":                 _title(p, "ID Póliza"),
        "paciente":           _text(p, "Nombre paciente"),
        "cedula":             _text(p, "Cédula"),
        "plan":               _select(p, "Plan"),
        "coberturas":         _multi(p, "Coberturas activas"),
        "copago_consulta":    _number(p, "Copago consulta ($)"),
        "copago_especialista":_number(p, "Copago especialista ($)"),
        "copago_emergencia":  _number(p, "Copago emergencia ($)"),
        "deducible":          _number(p, "Deducible anual ($)"),
        "limite_anual":       _number(p, "Límite anual ($)"),
        "estado":             _select(p, "Estado"),
        "aseguradora":        _select(p, "Aseguradora"),
    }


# ── LEER HOSPITALES ───────────────────────────────────────────────

def get_hospitals(plan: str, specialty: str = None) -> list:
    """
    Retorna hospitales que aceptan el plan del paciente.
    Si se pasa specialty, filtra los que atienden esa especialidad.
    """
    results = notion.databases.query(database_id=HOSPITALS_DB)
    hospitals = []

    for page in results["results"]:
        p = page["properties"]
        planes     = _multi(p, "Planes aceptados")
        especialidades = _multi(p, "Especialidades")

        if plan not in planes:
            continue
        if specialty and specialty not in especialidades:
            continue

        hospitals.append({
            "nombre":         _title(p, "Nombre"),
            "especialidades": especialidades,
            "planes":         planes,
            "costo_consulta": _number(p, "Costo consulta ($)"),
            "costo_especialista": _number(p, "Costo especialista ($)"),
            "direccion":      _text(p, "Dirección"),
            "telefono":       _text(p, "Teléfono"),
            "calificacion":   _number(p, "Calificación"),
        })

    # Ordenar por menor costo de especialista
    hospitals.sort(key=lambda h: h["costo_especialista"])
    return hospitals


# ── GUARDAR EN HISTORIAL ─────────────────────────────────────────

def save_consultation(
    policy_id: str,
    symptom: str,
    specialty: str,
    hospital: str,
    copago: float,
    full_response: str,
) -> str:
    now = datetime.utcnow()
    consultation_id = f"CONS-{now.strftime('%Y%m%d%H%M%S')}"

    notion.pages.create(
        parent={"database_id": HISTORY_DB},
        properties={
            "ID Consulta":          {"title": [{"text": {"content": consultation_id}}]},
            "ID Póliza":            {"rich_text": [{"text": {"content": policy_id}}]},
            "Síntoma ingresado":    {"rich_text": [{"text": {"content": symptom}}]},
            "Especialidad sugerida":{"select": {"name": specialty or "General"}},
            "Hospital recomendado": {"rich_text": [{"text": {"content": hospital or ""}}]},
            "Copago calculado ($)": {"number": copago or 0},
            "Respuesta completa":   {"rich_text": [{"text": {"content": full_response[:2000]}}]},
            "Fecha consulta":       {"date": {"start": now.isoformat()}},
        }
    )
    return consultation_id
