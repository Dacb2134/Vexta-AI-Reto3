import os
import json
import google.generativeai as genai
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

SYSTEM_PROMPT = """Eres PulseAI, un asistente experto en seguros médicos de Ecuador.
Ayudas a los pacientes a entender su cobertura ANTES de ir al médico.
Siempre respondes en español, con tono cálido, claro y empático.

Cuando el paciente describa un síntoma, DEBES:
1. Identificar la especialidad médica más apropiada
2. Calcular el copago exacto según su plan
3. Recomendar el hospital más conveniente de su red

RESPONDE SIEMPRE con este JSON exacto (sin markdown, sin texto extra):
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
y deja los demás campos como null."""


def analyze(policy: dict, hospitals: list, symptom: str, history: list) -> dict:
    coberturas_str   = ", ".join(policy.get("coberturas", [])) or "No especificadas"
    hospitales_str   = "\n".join([
        f"- {h['nombre']} | Especialidades: {', '.join(h['especialidades'])} | "
        f"Copago especialista: ${h['costo_especialista']} | "
        f"Dir: {h['direccion']} | Tel: {h['telefono']}"
        for h in hospitals
    ]) or "No hay hospitales disponibles para este plan."

    user_content = f"""DATOS DE LA PÓLIZA (ID: {policy['id']}):
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

    # Construir historial de mensajes
    messages = []
    for msg in history[-6:]:  # últimos 6 mensajes para no exceder contexto
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": user_content})

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1000,
        system=SYSTEM_PROMPT,
        messages=messages,
    )

    raw = response.content[0].text.strip()

    # Limpiar si Claude agrega markdown
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    result = json.loads(raw)
    return result
