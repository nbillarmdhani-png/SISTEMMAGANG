// src/config/llm.js
// Abstraksi pemanggilan LLM (Gemini atau OpenAI)
import { env } from './env.js';

/**
 * Memanggil LLM dengan konteks riwayat chat dan daftar kompetensi.
 * @param {{ riwayat: Array, kompetensi: Array }} ctx
 * @returns {Promise<string>} JSON string mentah dari LLM
 */
export async function callLLM({ riwayat, kompetensi }) {
  const daftarKompetensi = kompetensi.map((k) => k.nama_kompetensi).join(', ');

  const systemPrompt = `Kamu adalah asisten pemetaan kompetensi magang untuk mahasiswa Indonesia.
Tugas: tanyakan satu hal per giliran tentang kemampuan teknis dan nonteknis mahasiswa
beserta tingkatnya (pemula, menengah, mahir). Gunakan bahasa Indonesia yang sopan dan singkat.
Hanya gunakan nama kompetensi dari daftar: ${daftarKompetensi}.
Beri confidence 0-1 untuk tiap kompetensi yang kamu simpulkan dari jawaban mahasiswa.
Balas HANYA dengan JSON: { "reply", "intent", "skills": [{ "nama", "level", "confidence" }], "selesai" }.
Jangan meminta data pribadi di luar kebutuhan pemetaan.`;

  const messages = riwayat.map((p) => ({
    role: p.peran === 'user' ? 'user' : 'assistant',
    content: p.isi_pesan,
  }));

  if (env.LLM_PROVIDER === 'gemini') {
    return callGemini(systemPrompt, messages);
  }
  return callOpenAI(systemPrompt, messages);
}

async function callGemini(systemPrompt, messages) {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(env.LLM_API_KEY);
  const model = genAI.getGenerativeModel({
    model: env.LLM_MODEL,
    systemInstruction: systemPrompt,
  });

  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
  const lastMessage = messages.at(-1)?.content ?? '';

  const chat = model.startChat({ history });
  const result = await chat.sendMessage(lastMessage);
  return result.response.text();
}

async function callOpenAI(systemPrompt, messages) {
  const { default: OpenAI } = await import('openai');
  const openai = new OpenAI({ apiKey: env.LLM_API_KEY });
  const completion = await openai.chat.completions.create({
    model: env.LLM_MODEL,
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    response_format: { type: 'json_object' },
  });
  return completion.choices[0].message.content;
}
