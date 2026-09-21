import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import apiClient from "../../api/client";

export default function ChatBox({ ticketId, senderRole, senderName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const ws = useRef(null);
  const messagesEndRef = useRef(null);

  // Fetch initial chat history
  useEffect(() => {
    apiClient.get(`/api/chat/${ticketId}`)
      .then(res => setMessages(res.data))
      .catch(err => console.error("Failed to load chat history:", err));
  }, [ticketId]);

  // Connect to WebSocket
  useEffect(() => {
    const baseURL = apiClient.defaults.baseURL || "http://localhost:8000";
    const wsBaseURL = baseURL.replace(/^http/, "ws");
    
    const socket = new WebSocket(`${wsBaseURL}/ws/chat/${ticketId}`);
    ws.current = socket;

    socket.onmessage = (event) => {
      const newMsg = JSON.parse(event.data);
      setMessages(prev => [...prev, newMsg]);
    };

    return () => {
      socket.close();
    };
  }, [ticketId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !ws.current) return;

    const payload = {
      sender_role: senderRole,
      sender_name: senderName,
      content: input.trim(),
    };

    ws.current.send(JSON.stringify(payload));
    setInput("");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '400px', backgroundColor: '#fff', border: '1px solid var(--saas-border)', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid var(--saas-border)', backgroundColor: '#f9fafb' }}>
        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>Case Discussion</h3>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--saas-fg-muted)' }}>Real-time chat</p>
      </div>
      
      <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--saas-fg-muted)', marginTop: '20px' }}>No messages yet. Start the conversation!</div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender_role === senderRole;
            return (
              <div key={idx} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                {!isMe && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--saas-fg-muted)', marginBottom: '4px', marginLeft: '4px' }}>
                    {msg.sender_name} ({msg.sender_role === 'doctor' ? 'Doctor' : msg.sender_role === 'patient' ? 'Patient' : 'PHC'})
                  </div>
                )}
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '16px',
                  backgroundColor: isMe ? '#0052FF' : '#f3f4f6',
                  color: isMe ? '#fff' : '#1f2937',
                  borderBottomRightRadius: isMe ? '4px' : '16px',
                  borderBottomLeftRadius: !isMe ? '4px' : '16px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  fontSize: '0.95rem'
                }}>
                  {msg.content}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--saas-fg-muted)', marginTop: '4px', textAlign: isMe ? 'right' : 'left' }}>
                  {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} style={{ padding: '12px', borderTop: '1px solid var(--saas-border)', display: 'flex', gap: '8px', backgroundColor: '#f9fafb' }}>
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Type a message..."
          style={{ flex: 1, padding: '10px 14px', borderRadius: '24px', border: '1px solid var(--saas-border)', outline: 'none' }}
        />
        <button 
          type="submit" 
          disabled={!input.trim()}
          style={{ 
            padding: '10px', 
            borderRadius: '50%', 
            border: 'none', 
            backgroundColor: input.trim() ? '#0052FF' : '#e5e7eb', 
            color: '#fff', 
            cursor: input.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
