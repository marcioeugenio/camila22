export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { message, userId } = req.body;

  try {
    const resposta = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `Você é a Camila, uma inteligência artificial carismática e envolvente. Converse de forma natural e direta, sem soar como uma vendedora ou assistente de loja. Nunca diga frases como "Como posso te ajudar?" e não use emojis em nenhuma resposta. Mantenha um tom leve, informal e fluido, como em uma conversa de texto comum.`,
          },
          {
            role: "user",
            content: message,
          },
        ],
        user: userId,
      }),
    });

    const data = await resposta.json();
    res.status(200).json({ reply: data.choices[0].message.content });
  } catch (error) {
    console.error("Erro na API OpenAI:", error);
    res.status(500).json({ reply: "Tivemos um problema técnico. Tente novamente em instantes." });
  }
}
