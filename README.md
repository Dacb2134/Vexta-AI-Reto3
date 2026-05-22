# ◎ PulseAI — Estimador de Copago y Cobertura

> **hackIAthon VIAMATICA 2024 · Reto 3**
> Agente conversacional que ayuda al paciente a entender su cobertura antes de atenderse.

---

## ¿Qué hace?

El paciente describe su síntoma en lenguaje natural. PulseAI cruza esa información
con su póliza en Notion y responde en segundos con:
- La **especialidad médica** recomendada
- El **copago exacto** según su plan
- El **hospital más conveniente** de la red

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | HTML + CSS + JS puro |
| Backend | Python 3.11 + FastAPI |
| Agente IA | Claude API (claude-sonnet-4) |
| Base de datos | Notion API (3 tablas) |
| Deploy backend | Railway |
| Deploy frontend | Vercel |

---

## Setup local

```bash
# 1. Clonar
git clone https://github.com/TU_USUARIO/pulseai-reto3.git
cd pulseai-reto3

# 2. Backend
cd backend
python -m venv venv
source venv/bin/activate   # Mac/Linux
venv\Scripts\activate      # Windows
pip install -r requirements.txt
cp ../.env.example .env
# Editar .env con tus API keys

# 3. Correr
uvicorn main:app --reload --port 8000
# Docs: http://localhost:8000/docs
```

---

## Variables de entorno

```env
ANTHROPIC_API_KEY=sk-ant-...
NOTION_API_KEY=secret_...
NOTION_POLICIES_DB_ID=<32 caracteres>
NOTION_HOSPITALS_DB_ID=<32 caracteres>
NOTION_HISTORY_DB_ID=<32 caracteres>
CORS_ORIGINS=http://127.0.0.1:5500,https://tu-app.vercel.app
```

Ver `notion/schema.md` para instrucciones de Notion.

---

## Estructura

```
pulseai-reto3/
├── backend/
│   ├── main.py              # Entry point FastAPI
│   ├── router.py            # POST /api/chat
│   ├── agent.py             # Prompt + Claude API
│   ├── notion_service.py    # Lee pólizas, hospitales, guarda historial
│   ├── models.py            # ChatRequest, ChatResponse
│   └── requirements.txt
├── frontend/
│   └── index.html           # UI completa (generada con prompt IA)
├── notion/
│   └── schema.md            # Estructura exacta de las 3 DBs
├── docs/
│   └── demo.gif
├── .env.example
├── .gitignore
└── README.md
```

---

## Demo

> *[Agregar GIF aquí]*

Casos de prueba:
- `POL-2024-001` + "me duele el pecho" → Cardiología · $45 · Hospital Metropolitano
- `POL-2024-002` + "me lesioné la rodilla" → Traumatología · $65 · Hospital de los Valles
- `POL-2024-003` + "tengo fiebre" → Medicina General · $50 · Hospital Vozandes

---

## Equipo

| Nombre | Rol |
|--------|-----|
| [Persona A] | Notion + Datos + README |
| [Persona B] | Frontend + Deploy Vercel |
| [Persona C] | Backend + Agente + Deploy Railway |

---

🔗 **Agente en vivo:** [URL Vercel]
📁 **Repositorio:** [URL GitHub]
