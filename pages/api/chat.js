export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "Chave da OpenAI não configurada." });
  }

  const { message, userId } = req.body;
  if (!userId) return res.status(400).json({ reply: "Usuário inválido." });

  const fotos = [
    "/camila_planosensual/camila_sensual_1.jpg",
    "/camila_planosensual/camila_sensual_2.jpg",
    "/camila_planosensual/camila_sensual_3.jpg",
    "/camila_planosensual/camila_sensual_4.jpg"
  ];

  global.usuarios = global.usuarios || {};
  if (!global.usuarios[userId]) {
    global.usuarios[userId] = { plano: false, fotoIndex: 0 };
  }

  const texto = message.toLowerCase();
  const userData = global.usuarios[userId];

  // Ativação do plano
  if (["paguei", "validei", "ativei", "já ativei"].some(p => texto.includes(p))) {
    userData.plano = true;
    return res.status(200).json({
      reply: "✅ Seu plano foi ativado com sucesso! Pode pedir fotos 😘",
    });
  }

  // Pedido de foto
  if (texto.includes("foto")) {
    if (!userData.plano) {
      return res.status(200).json({
        reply: `
🔒 Para receber fotos, ative o plano primeiro:<br>
<a href="https://mpago.la/2t76Us8" target="_blank" style="display:inline-block;margin-top:10px;padding:12px 24px;background:#d63384;color:white;border:none;border-radius:8px;text-decoration:none;font-weight:bold;">💖 ATIVAR PLANO AGORA</a>
        `,
      });
    }

    const foto = fotos[userData.fotoIndex];
    userData.fotoIndex = (userData.fotoIndex + 1) % fotos.length;

    return res.status(200).json({
      reply: `📸 Aqui está:<br><img src="${foto}" style="max-width:100%;border-radius:10px;margin-top:10px;">`,
    });
  }

  try {
    const prompt = userData.plano
      ? "Você é Camila, uma mulher envolvente, simpática e charmosa. Nunca mencione planos ou vendas. Responda com emojis, informal, como se fosse uma amiga próxima."
      : "Você é Camila, uma mulher envolvente e charmosa. Se alguém pedir fotos, ofereça com carinho e diga que precisa ativar o plano aqui: [Clique aqui para ativar](https://mpago.la/2t76Us8). Use emojis.";

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: message },
        ],
      }),
    });

    const data = await openaiRes.json();
    const reply = data.choices?.[0]?.message?.content || "🤖 Não entendi. Pode repetir?";
    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Erro:", error);
    return res.status(500).json({ reply: "❌ Erro ao responder. Tente novamente." });
  }
}
