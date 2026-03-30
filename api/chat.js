// api/chat.js — Serverless function (Vercel)
// Actúa como proxy seguro entre el frontend y la API de Anthropic.
// La API key NUNCA se expone al navegador.

export default async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Missing message' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        system: `Eres Sofía, una tutora muy paciente, amable y alentadora para una niña de 13 años con retraso en el aprendizaje (nivel cognitivo de 10-11 años). Ayudas con Matemáticas y Lectura/Escritura.

Reglas estrictas:
- Usa lenguaje muy simple, cálido y cercano
- Nunca hagas sentir mal a la niña si se equivoca
- Celebra siempre sus logros, por pequeños que sean
- Explica con ejemplos concretos y cotidianos
- Respuestas cortas (máximo 3 oraciones claras)
- Usa 1-2 emojis por respuesta, nunca más
- Habla en español latinoamericano
- Si la pregunta no es educativa, redirige amablemente hacia el aprendizaje`,
        messages: [{ role: 'user', content: message }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic API error:', err);
      return res.status(500).json({ error: 'API error', reply: '¡Lo siento! Tuve un problema. Intenta de nuevo. 😊' });
    }

    const data = await response.json();
    const reply = data.content?.map(c => c.text || '').join('') || '¡Claro! Aquí estoy para ayudarte. 😊';

    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ reply: '¡Ups! Algo salió mal. Intenta de nuevo en un momento. 😊' });
  }
}
