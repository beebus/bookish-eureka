import { useEffect, useRef, useState } from "react";

export default function App() {
  const [personas, setPersonas] = useState([]);
  const [persona, setPersona] = useState("friendly");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    fetch("/api/personas")
      .then((r) => r.json())
      .then(setPersonas)
      .catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;

    const history = [...messages, { role: "user", content: text }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persona, messages: history }),
      });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let reply = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        setMessages([...history, { role: "assistant", content: reply }]);
      }
    } catch {
      setMessages([
        ...history,
        { role: "assistant", content: "[Could not reach the backend]" },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function reset(next) {
    setPersona(next);
    setMessages([]);
  }

  return (
    <div className="app">
      <header>
        <h1>Recruiter Practice</h1>
        <select value={persona} onChange={(e) => reset(e.target.value)} disabled={busy}>
          {personas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </header>

      <main>
        {messages.length === 0 && (
          <p className="hint">Say hello to start your practice screen.</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            {m.content || "…"}
          </div>
        ))}
        <div ref={bottomRef} />
      </main>

      <form onSubmit={send}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your reply…"
          autoFocus
        />
        <button disabled={busy || !input.trim()}>Send</button>
      </form>
    </div>
  );
}
