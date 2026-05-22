// ── SERVICIO: API ────────────────────────────────────────────────
// Toda comunicación con el backend está aquí.
// Para agregar un endpoint nuevo: solo agregar una función aquí.

const ApiService = {

  // POST /api/chat — consulta del paciente
  async sendMessage(symptom, history = []) {
    const res = await fetch(`${CONFIG.API_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        policy_id: CONFIG.POLICY_ID,
        symptom,
        history,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || `Error ${res.status}`);
    }

    return res.json();
  },

  // GET /api/policy/:id — datos de la póliza
  async getPolicy(policyId) {
    const res = await fetch(`${CONFIG.API_URL}/api/policy/${policyId}`);

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || `Error ${res.status}`);
    }

    return res.json();
  },

  // GET /health — verificar que el backend está vivo
  async ping() {
    const res = await fetch(`${CONFIG.API_URL}/health`);
    return res.ok;
  },
};
