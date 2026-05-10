export default async function handler(req, res) {
  const { coin } = req.query;
  if (!coin) return res.status(400).json({ error: 'Isi nama coin' });
  
  try {
    const prompt = `Kamu AI Analyst crypto. Analisis ${coin} sekarang. Format: 1. Tren: Bullish/Bearish 2. Support & Resistance 3. Sinyal: Buy/Sell/Hold 4. Alasan 1 kalimat. Jawab langsung.`;

    const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await aiRes.json();
    
    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    res.status(200).json({ 
      berita: 'Analisis AI langsung untuk ' + coin,
      analisis: data.choices[0].message.content 
    });

  } catch (error) {
    res.status(500).json({ error: 'Gagal: ' + error.message });
  }
}
