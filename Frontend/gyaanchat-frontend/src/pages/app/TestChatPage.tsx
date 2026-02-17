import { useMemo, useState, useRef, useEffect } from "react";
import { chatTenant } from "../../api/endpoints";
import "../../styles/chat.css";

type Msg = {
    role: "user" | "assistant";
    text: string;
    sources?: Array<{ doc_id: string; chunk_index: number; filename: string }>;
};

export default function TestChatPage() {
    const tenantId = useMemo(() => localStorage.getItem("gyaanchat_tenant_id") || "tenantA", []);
    const [input, setInput] = useState("");
    const [msgs, setMsgs] = useState<Msg[]>([]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string>("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [msgs, busy]);

    async function send() {
        const q = input.trim();
        if (!q || busy) return;

        setError("");
        setMsgs((m) => [...m, { role: "user", text: q }]);
        setInput("");
        setBusy(true);

        try {
            const res = await chatTenant(tenantId, q);
            setMsgs((m) => [...m, {
                role: "assistant",
                text: res.answer || "I'm not sure how to answer that.",
                sources: res.sources
            }]);
        } catch (e: any) {
            setError(e?.message || "Chat request failed. Check backend is running.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="chatPage">
            <header className="pageHeader">
                <div>
                    <h1 className="pageTitle">Test Chat</h1>
                    <p className="muted">Experience your AI assistant in real-time.</p>
                </div>
            </header>

            <div className="card chatContainer" ref={scrollRef}>
                {msgs.length === 0 && !busy && (
                    <div style={{ textAlign: 'center', padding: '40px 0' }} className="muted">
                        No messages yet. Ask something about your documents!
                    </div>
                )}

                {msgs.map((m, i) => (
                    <div key={i} className={`chatBubble ${m.role === 'user' ? 'userBubble' : 'assistantBubble'}`}>
                        <div className="chatRole">{m.role === 'user' ? 'You' : 'Assistant'}</div>
                        <div className="chatText">{m.text}</div>

                        {m.sources && m.sources.length > 0 && (
                            <div className="sourcesSection">
                                <span className="sourceTitle">Sources:</span>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {m.sources.map((s, idx) => (
                                        <span key={idx} className="sourceLink">
                                            {s.filename || `Doc ${s.doc_id ? s.doc_id.slice(0, 4) : "—"}...`} (Ch {s.chunk_index})
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {busy && (
                    <div className="typingIndicator">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                    </div>
                )}

                {error && <div className="alert">{error}</div>}
            </div>

            <div className="chatInputWrapper">
                <input
                    className="input"
                    style={{ margin: 0 }}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    disabled={busy}
                />
                <button
                    className="button"
                    style={{ margin: 0, width: "auto", padding: "10px 24px" }}
                    onClick={send}
                    disabled={busy || !input.trim()}
                >
                    {busy ? "Thinking..." : "Send"}
                </button>
            </div>
        </div>
    );
}
