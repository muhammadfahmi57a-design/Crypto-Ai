export default async function handler(req, res) {
  if (req.method!== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { coins, topics, chatHistory, newsContext } = req.body;
  const date = new Date().toLocaleString('id-ID');
  let prompt = "";
  if (chatHistory) {
    const system = `Anda AI Analyst crypto. Waktu: ${date}. Koin dipantau: ${coins.join(", ")}. Jawab singkat bahasa Indonesia.`;
    const messages = [{ role: "system", content: system },...chatHistory.map(m => ({ role: m.role === "model"? "assistant" : "user", content: m.text }))];
    const openrouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}` }, body: JSON.stringify({ model: "google/gemini-flash-1.5", messages }) });
    const data = await openrouterRes.json();
    return res.status(200).json({ text: data.choices[0].message.content });
  } else {
    prompt = `Waktu: ${date}. Berdasarkan berita:\n${newsContext}\n\nBuat analisis sinyal trading untuk koin: ${coins.join(", ")}. Balas HANYA JSON: {"signals":[{"symbol":"BTC","action":"BUY","sentiment":"BULLISH","confidence":75,"target":"+8%","timeframe":"24-48 jam","reason":"Momentum naik","risk":"MEDIUM"}],"summary":"Pasar bullish"}`;
  }
  try {
    const openrouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}` }, body: JSON.stringify({ model: "google/gemini-flash-1.5", messages: [{ role: "user", content: prompt }] }) });
    const data = await openrouterRes.json();
    const text = data.choices[0].message.content;
    res.status(200).json({ text });
  } catch(e) { res.status(500).json({ error: e.message }); }
}
