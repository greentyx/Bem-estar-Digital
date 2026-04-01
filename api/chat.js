// api/chat.js — Vercel Serverless Function
// A chave da API fica só aqui, no servidor. Nunca vai pro browser.

const https = require('https');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { messages, system } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Campo messages é obrigatório' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(200).json({ reply: '⚠️ ANTHROPIC_API_KEY não encontrada no Vercel. Vai em Settings → Environment Variables e adiciona a chave.' });
  }

  const body = JSON.stringify({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    system: system || '',
    messages,
  });

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const request = https.request(options, (response) => {
      let data = '';
      response.on('data', (chunk) => { data += chunk; });
      response.on('end', () => {
        try {
          const parsed = JSON.parse(data);

          // Se a Anthropic retornou erro, mostra no chat para diagnóstico
          if (parsed.error) {
            res.status(200).json({ reply: '⚠️ Erro da API: ' + parsed.error.type + ' — ' + parsed.error.message });
            resolve();
            return;
          }

          const reply = parsed.content?.[0]?.text || 'Resposta vazia da API.';
          res.status(200).json({ reply });
        } catch (e) {
          res.status(200).json({ reply: '⚠️ Erro ao processar resposta: ' + data.slice(0, 200) });
        }
        resolve();
      });
    });

    request.on('error', (e) => {
      res.status(200).json({ reply: '⚠️ Erro de rede: ' + e.message });
      resolve();
    });

    request.write(body);
    request.end();
  });
};
