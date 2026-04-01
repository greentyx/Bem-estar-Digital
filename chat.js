// api/chat.js — Vercel Serverless Function
// A chave da API fica só aqui, no servidor. Nunca vai pro browser.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { messages, system } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Campo messages é obrigatório' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY não configurada');
    return res.status(500).json({ error: 'Servidor não configurado' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system: system || '',
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Erro Anthropic:', err);
      return res.status(response.status).json({ error: 'Erro ao chamar a API' });
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text ?? 'Não consegui responder agora. Tente de novo!';
    return res.status(200).json({ reply });

  } catch (err) {
    console.error('Erro interno:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
