import os
from datetime import datetime
from notion_client import Client
from dotenv import load_dotenv

load_dotenv()

print("=== DEBUG NOTION ===")
print("KEY:", os.getenv("NOTION_API_KEY"))
print("POLICIES_DB:", os.getenv("NOTION_POLICIES_DB_ID"))
print("HOSPITALS_DB:", os.getenv("NOTION_HOSPITALS_DB_ID"))
print("HISTORY_DB:", os.getenv("NOTION_HISTORY_DB_ID"))
print("===================")
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
        filter={"property": "ID Póliza", "rich_text": {"equals": policy_id}}
    )
    if not results["results"]:
        raise ValueError(f"Póliza '{policy_id}' no encontrada.")

    p = results["results"][0]["properties"]
    return {
        "poliza":             _title(p, "Póliza"), 
        "id":                 _text(p, "ID Póliza"),
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
        "fecha_inicio":       _date(p, "Fecha inicio"), 
        "aseguradora":        _select(p, "Aseguradora"),
    }

# ── LEER HOSPITALES ───────────────────────────────────────────────

def get_hospitals(plan: str, specialty: str = None) -> list:
    """
    Retorna hospitales que aceptan el plan del paciente.
    Si se pasa specialty, filtra los que atienden esa especialidad.
    Maneja paginación para bases de datos con más de 100 registros.
    """
    hospitals = []
    has_more = True
    start_cursor = None

    while has_more:
        results = notion.databases.query(
            database_id=HOSPITALS_DB,
            start_cursor=start_cursor,
            page_size=100
        )

        for page in results["results"]:
            p = page["properties"]
            planes         = _multi(p, "Planes aceptados")
            especialidades = _multi(p, "Especialidades")

            if plan not in planes:
                continue
            if specialty and specialty not in especialidades:
                continue

            hospitals.append({
                "campo":              _title(p, "Campo"),
                "nombre":             _text(p, "Nombre"), 
                "ciudad":             _select(p, "Ciudad"), 
                "especialidades":     especialidades,
                "planes":             planes,
                "costo_consulta":     _number(p, "Costo consulta ($)"),
                "costo_especialista": _number(p, "Costo especialista ($)"),
                "direccion":          _text(p, "Dirección"),
                "telefono":           _text(p, "Teléfono"),
                "calificacion":       _number(p, "Calificación"),
            })

        has_more = results.get("has_more", False)
        start_cursor = results.get("next_cursor", None)

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
            "Campo":                {"title": [{"text": {"content": consultation_id}}]},
            "ID Consulta":          {"rich_text": [{"text": {"content": consultation_id}}]},
            "ID Póliza":            {"rich_text": [{"text": {"content": policy_id}}]},
            "Síntoma ingresado":    {"rich_text": [{"text": {"content": symptom}}]},
            "Especialidad sugerida":{"select": {"name": specialty or "General"}},
            "Hospital recomendado": {"rich_text": [{"text": {"content": hospital or ""}}]},
            "Copago calculado ($)": {"number": copago or 0},
            "Respuesta completa":   {"rich_text": [{"text": {"content": full_response[:2000]}}]}
        }
    )
    return consultation_id

# ── OBTENER PÓLIZA POR CEDULA ────────────────────────────────────────
def get_policy_by_cedula(cedula: str) -> dict:
    results = notion.databases.query(
        database_id=POLICIES_DB,
        filter={"property": "Cédula", "rich_text": {"equals": cedula}}
    )
    if not results["results"]:
        raise ValueError(f"No se encontró póliza para la cédula '{cedula}'.")

    p = results["results"][0]["properties"]
    return {
        "poliza":             _title(p, "Póliza"),
        "id":                 _text(p, "ID Póliza"),
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
        "fecha_inicio":       _date(p, "Fecha inicio"),
        "aseguradora":        _select(p, "Aseguradora"),
    }
 
#OBTENER HISTORIAL POR PÓLIZA (CEDULA)   
def get_history_by_policy(policy_id: str) -> list:
    results = notion.databases.query(
        database_id=HISTORY_DB,
        filter={"property": "ID Póliza", "rich_text": {"equals": policy_id}}
    )
    
    history = []
    for page in results["results"]:
        p = page["properties"]
        history.append({
            "consultation_id": _title(p, "Campo"),
            "symptom":         _text(p, "Síntoma ingresado"),
            "specialty":       _select(p, "Especialidad sugerida"),
            "hospital":        _text(p, "Hospital recomendado"),
            "copago":          _number(p, "Copago calculado ($)"),
            "response":        _text(p, "Respuesta completa"),
            "date":            _date(p, "Fecha consulta"),
        })
    
    # Ordenar por fecha más reciente primero
    history.sort(key=lambda h: h["date"] or "", reverse=True)
    return history    
    
    