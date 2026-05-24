# ◎ PulseAI — Estimador de Copago y Cobertura

> **hackIAthon VIAMATICA 2024 · Reto 3**  
> Agente conversacional que ayuda al paciente a entender su cobertura médica antes de atenderse.

---

## ¿Qué hace?

El paciente ingresa su cédula y describe su síntoma en lenguaje natural. PulseAI cruza esa información con su póliza en Notion y responde en segundos con:

- La **especialidad médica** recomendada según el síntoma
- El **copago exacto** según su plan de seguro
- El **hospital más conveniente** de la red
- El **historial** de consultas anteriores

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | HTML + CSS + JS puro (MVC) |
| Backend | Python + FastAPI |
| Agente IA | Google Gemini 2.5 Flash |
| Base de datos | Notion API (3 tablas) |
| Deploy backend | Railway |
| Deploy frontend | Vercel |

---

## Links

🔗 **Agente en vivo:** https://vexta-ai-reto3.vercel.app  
📁 **Repositorio:** https://github.com/Dacb2134/Vexta-AI-Reto3

---

## Setup local

```bash
# 1. Clonar
git clone https://github.com/Dacb2134/Vexta-AI-Reto3.git
cd Vexta-AI-Reto3

# 2. Entrar a backend
cd backend

# 3. Crear entorno virtual
python -m venv venv

# 4. Activar entorno virtual
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

# 5. Instalar dependencias
pip install -r requirements.txt

# 6. Crear archivo .env
cp ../.env.example .env
# Editar .env con tus API keys

# 7. Correr el servidor
uvicorn main:app --reload --port 8000
# Docs: http://localhost:8000/docs
```

---

## Variables de entorno

```env
GEMINI_API_KEY=AIzaSy...
NOTION_API_KEY=ntn_...
NOTION_POLICIES_DB_ID=<32 caracteres>
NOTION_HOSPITALS_DB_ID=<32 caracteres>
NOTION_HISTORY_DB_ID=<32 caracteres>
CORS_ORIGINS=http://127.0.0.1:5500,https://vexta-ai-reto3.vercel.app
```

---

## Estructura del proyecto

```
Vexta-AI-Reto3/
├── backend/
│   ├── main.py              # Entry point FastAPI
│   ├── router.py            # Endpoints REST
│   ├── agent.py             # Prompt + Gemini API
│   ├── notion_service.py    # Pólizas, hospitales, historial
│   ├── models.py            # ChatRequest, ChatResponse
│   └── requirements.txt
├── frontend/
│   ├── login.html           # Pantalla de login por cédula
│   ├── login.css            # Estilos del login
│   ├── index.html           # Chat principal
│   ├── style.css            # Sistema de diseño PulseAI
│   ├── config.js            # URL del backend y constantes
│   ├── components/
│   │   ├── MessageBubble.js     # Burbujas de chat
│   │   ├── CoverageCard.js      # Tarjeta de recomendación
│   │   └── TypingIndicator.js   # Indicador de escritura
│   └── services/
│       ├── api.js           # Llamadas al backend
│       ├── ui.js            # Renderizado del DOM
│       └── chat.js          # Controlador principal
├── .env.example
├── .gitignore
├── runtime.txt
└── README.md
```

---

## Endpoints API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/health` | Estado del servidor |
| `GET` | `/api/login/{cedula}` | Login por cédula |
| `POST` | `/api/chat` | Consulta al agente IA |
| `GET` | `/api/policy/{id}` | Datos de la póliza |
| `GET` | `/api/history/{policy_id}` | Historial de consultas |
| `DELETE` | `/api/history/{consultation_id}` | Eliminar consulta |

---

## Equipo — Vexta AI

| Nombre | Rol |
|--------|-----|
| Diego Antonio Constante Benavides | Backend + Agente IA + Deploy Railway |
| Michelle Pierina Pin Colorado | Notion + Base de datos + Frontend |
| Darlan Garcés Marín | Frontend + Deploy Vercel |

---

*hackIAthon VIAMATICA  · Equipo Vexta AI*