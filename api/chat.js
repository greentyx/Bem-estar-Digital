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
 
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(200).json({ reply: '⚠️ GROQ_API_KEY não encontrada. Vai em Settings → Environment Variables no Vercel e adiciona a chave.' });
  }
 
  // Groq usa o mesmo formato da OpenAI
  // O system prompt entra como primeira mensagem com role "system"
  const groqMessages = [
    { role: 'system', content: system || '' },
    ...messages
  ];
 
  const body = JSON.stringify({
    model: 'llama-3.1-8b-instant', // gratuito: 14.400 req/dia, renova todo dia
    max_tokens: 600,
    temperature: 0.7,
    messages: groqMessages,
  });
 
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.groq.com',
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
        'Content-Length': Buffer.byteLength(body),
      },
    };
 
    const request = https.request(options, (response) => {
      let data = '';
      response.on('data', (chunk) => { data += chunk; });
      response.on('end', () => {
        try {
          const parsed = JSON.parse(data);
 
          // Mostra erro detalhado no chat para facilitar diagnóstico
          if (parsed.error) {
            res.status(200).json({
              reply: '⚠️ Erro da API Groq: ' + parsed.error.type + ' — ' + parsed.error.message
            });
            resolve();
            return;
          }
 
          const reply = parsed.choices?.[0]?.message?.content || 'Não consegui responder agora. Tente de novo!';
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
 
