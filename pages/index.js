import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [mensagem, setMensagem] = useState("");
  const [chat, setChat] = useState([
    {
      remetente: "Camila",
      texto: "Oi, eu sou a Camila. Como é seu nome? 😊",
    },
  ]);

  const chatRef = useRef(null);
  const userIdRef = useRef(
    typeof window !== "undefined"
      ? localStorage.getItem("userId") || crypto.randomUUID()
      : ""
  );

  useEffect(() => {
    localStorage.setItem("userId", userIdRef.current);
  }, []);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chat]);

  const enviar = async () => {
    if (!mensagem.trim()) return;

    setChat((prev) => [...prev, { remetente: "Você", texto: mensagem }]);

    const resposta = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: mensagem,
        userId: userIdRef.current,
      }),
    });

    const data = await resposta.json();
    setChat((prev) => [...prev, { remetente: "Camila", texto: data.reply }]);
    setMensagem("");
  };

  return (
    <main style={{ maxWidth: 600, margin: "2rem auto", padding: "1rem" }}>
      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <img
          src="/camila_perfil.jpg"
          alt="Camila"
          style={{
            width: 80,
            borderRadius: "50%",
            border: "2px solid #d63384",
            marginBottom: "0.5rem",
          }}
        />
        <h2>
          💬 <span style={{ color: "#d63384" }}>Camila</span>{" "}
          <small style={{ fontSize: "0.8rem", color: "gray" }}>
            Online agora
          </small>
        </h2>
      </div>

      <div
        id="chat"
        ref={chatRef}
        style={{
          maxHeight: 400,
          overflowY: "auto",
          background: "#fff",
          padding: "1rem",
          borderRadius: "10px",
          marginBottom: "1rem",
          border: "1px solid #ccc",
        }}
      >
        {chat.map((m, i) => (
          <div key={i} style={{ marginBottom: "0.5rem" }}>
            <strong
              style={{
                color: m.remetente === "Camila" ? "#d63384" : "#0d6efd",
              }}
            >
              {m.remetente}:
            </strong>{" "}
            <span dangerouslySetInnerHTML={{ __html: m.texto }} />
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          enviar();
        }}
        style={{ display: "flex", gap: "0.5rem" }}
      >
        <input
          type="text"
          placeholder="Digite sua mensagem..."
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          style={{ flex: 1, padding: "0.5rem" }}
        />
        <button type="submit">Enviar</button>
      </form>
    </main>
  );
}
