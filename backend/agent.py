import os
import json
import google.generativeai as genai

# ── CONFIGURACIÓN GEMINI ─────────────────────────────────────────
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    system_instruction="""Eres PulseAI, un asistente experto en seguros médicos de Ecuador.
Ayudas a los pacientes a entender su cobertura ANTES de ir al médico.
Siempre respondes en español, con tono cálido, claro y empático.

Cuando el paciente describa un síntoma, DEBES:
1. Identificar la especialidad médica más apropiada
2. Calcular el copago exacto según su plan
3. Recomendar el hospital más conveniente de su red

RESPONDE SIEMPRE con este JSON exacto (sin markdown, sin texto extra, sin bloques de código):
{
  "full_response": "Respuesta empática en 2-3 oraciones explicando la situación",
  "specialty": "Nombre de la especialidad",
  "copago": "$XX",
  "hospital": "Nombre del hospital",
  "address": "Dirección completa",
  "phone": "(0X) XXX-XXXX",
  "next_step": "Acción específica recomendada"
}

Si el síntoma es una emergencia (dolor de pecho severo, dificultad para respirar, pérdida de conciencia):
— specialty: "Emergencias"
— copago: el copago de emergencia del paciente
— next_step: "Llamar al 911 o ir a Emergencias inmediatamente"

Si no tienes suficiente información sobre el síntoma, pide más detalles en full_response
y deja specialty, copago, hospital, address, phone, next_step como null."""
)


# ── FUNCIÓN PRINCIPAL ────────────────────────────────────────────

def analyze(policy: dict, hospitals: list, symptom: str, history: list) -> dict:
    """
    Recibe los datos de la póliza, los hospitales disponibles,
    el síntoma del paciente y el historial de conversación.
    Retorna el JSON con la recomendación.
    """
    coberturas_str = ", ".join(policy.get("coberturas", [])) or "No especificadas"
    hospitales_str = "\n".join([
        f"- {h['nombre']} | Especialidades: {', '.join(h['especialidades'])} | "
        f"Copago especialista: ${h['costo_especialista']} | "
        f"Dirección: {h['direccion']} | Tel: {h['telefono']}"
        for h in hospitals
    ]) or "No hay hospitales disponibles para este plan."

    user_prompt = f"""DATOS DE LA PÓLIZA (ID: {policy['id']}):
Paciente: {policy['paciente']}
Plan: {policy['plan']}
Estado: {policy['estado']}
Coberturas activas: {coberturas_str}
Copago consulta general: ${policy['copago_consulta']}
Copago especialista: ${policy['copago_especialista']}
Copago emergencia: ${policy['copago_emergencia']}

RED DE HOSPITALES DISPONIBLE PARA ESTE PLAN:
{hospitales_str}

SÍNTOMA DEL PACIENTE:
"{symptom}"

Analiza el síntoma, identifica la especialidad y recomienda el hospital más conveniente."""

    # Construir historial para contexto conversacional
    gemini_history = []
    for msg in history[-6:]:  # últimos 6 mensajes para no exceder contexto
        role = "user" if msg.role == "user" else "model"
        gemini_history.append({"role": role, "parts": [msg.content]})

    # Iniciar chat con historial
    chat = model.start_chat(history=gemini_history)
    response = chat.send_message(user_prompt)

    raw = response.text.strip()

    # Limpiar si Gemini agrega bloques de código markdown
    if "```" in raw:
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    result = json.loads(raw)
    return result
