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
    <div style={{ display: 'flex', flexDirection: 'column', height: '420px', backgroundColor: '#FFFFFF', border: '1px solid #D9E2E8', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #D9E2E8', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#263238' }}>Case Discussion</h3>
          <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#607D8B' }}>Real-time encrypted clinical channel</p>
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '12px', backgroundColor: 'rgba(22, 160, 133, 0.1)', color: '#16A085' }}>
          Active
        </span>
      </div>
      
      <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#FFFFFF' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#90A4AE', margin: 'auto', fontSize: '0.9rem' }}>
            No messages yet. Send a message to begin clinical collaboration.
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender_role === senderRole;
            return (
              <div key={idx} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                {!isMe && (
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#607D8B', marginBottom: '4px', marginLeft: '4px' }}>
                    {msg.sender_name} ({msg.sender_role === 'doctor' ? 'Ophthalmologist' : msg.sender_role === 'patient' ? 'Patient' : 'PHC Worker'})
                  </div>
                )}
                <div style={{
                  padding: '11px 16px',
                  borderRadius: '16px',
                  backgroundColor: isMe ? '#1976D2' : '#F0F4F8',
                  color: isMe ? '#FFFFFF' : '#263238',
                  borderBottomRightRadius: isMe ? '4px' : '16px',
                  borderBottomLeftRadius: !isMe ? '4px' : '16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  fontSize: '0.92rem',
                  lineHeight: 1.45,
                }}>
                  {msg.content}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#90A4AE', marginTop: '4px', textAlign: isMe ? 'right' : 'left' }}>
                  {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} style={{ padding: '14px 20px', borderTop: '1px solid #D9E2E8', display: 'flex', gap: '10px', backgroundColor: '#FFFFFF' }}>
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Type a clinical note or message..."
          style={{ flex: 1, padding: '10px 16px', borderRadius: '24px', border: '1px solid #D9E2E8', outline: 'none', fontSize: '0.9rem', color: '#263238', backgroundColor: '#FFFFFF' }}
        />
        <button 
          type="submit" 
          disabled={!input.trim()}
          style={{ 
            padding: '10px 18px', 
            borderRadius: '24px', 
            border: 'none', 
            backgroundColor: input.trim() ? '#1976D2' : '#CFD8DC', 
            color: '#FFFFFF', 
            cursor: input.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 600,
            gap: '6px',
            transition: 'background-color 0.2s ease'
          }}
        >
          <span>Send</span>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
