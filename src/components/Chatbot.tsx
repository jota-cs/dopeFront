import { useState, useEffect, type FormEvent } from 'react';
import { api } from '../services/api';

interface Message {
  sender: 'user' | 'gemini';
  text: string;
}

interface ChatbotProps {
  activeTab: 'home' | 'chat';
  token: string | null;
}

export function Chatbot({ activeTab, token }: ChatbotProps) {
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([
    { sender: 'gemini', text: 'Olá! Sou o seu facilitador de conteúdo com IA. O que vamos criar hoje?' }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    async function loadChatHistory() {
      if (activeTab === 'chat' && token) {
        try {
          setChatLoading(true);
          const data = await api.get<any[]>('/chat/history');
          const formattedMessages: Message[] = [];
          
          data.forEach(item => {
            formattedMessages.push({ sender: 'user', text: item.prompt });
            formattedMessages.push({ sender: 'gemini', text: item.response });
          });

          if (formattedMessages.length > 0) {
            setChatHistory(formattedMessages);
          }
        } catch (error) {
          console.error("Erro ao carregar histórico", error);
        } finally {
          setChatLoading(false);
        }
      }
    }
    loadChatHistory();
  }, [activeTab, token]);

  async function handleSendMessage(event: FormEvent) {
    event.preventDefault();
    if (!chatMessage.trim() || chatLoading) return;

    const userPrompt = chatMessage;
    setChatMessage('');
    setChatLoading(true);
    setChatHistory((prev) => [...prev, { sender: 'user', text: userPrompt }]);

    try {
      const data = await api.post<{ response: string }>('/chat', { message: userPrompt });
      setChatHistory((prev) => [...prev, { sender: 'gemini', text: data.response }]);
    } catch (error: any) {
      setChatHistory((prev) => [...prev, { sender: 'gemini', text: `Erro de Conexão: ${error.message}` }]);
    } finally {
      setChatLoading(false);
    }
  }

  return (
    <section style={{ border: '1px solid #eee', borderRadius: '8px', display: 'flex', flexDirection: 'column', height: '450px', background: '#fff' }}>
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', background: '#fcfcfc' }}>
        {chatHistory.map((msg, index) => (
          <div key={index} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '75%', padding: '12px 16px', borderRadius: '8px', background: msg.sender === 'user' ? '#0070f3' : '#f1f0f0', color: msg.sender === 'user' ? '#fff' : '#000', whiteSpace: 'pre-wrap', fontSize: '15px', lineHeight: '1.4' }}>
            {msg.text}
          </div>
        ))}
        {chatLoading && (
          <div style={{ alignSelf: 'flex-start', background: '#e8e8e8', color: '#666', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', fontStyle: 'italic' }}>
            Gemini está processando seu conteúdo...
          </div>
        )}
      </div>

      <form onSubmit={handleSendMessage} style={{ display: 'flex', borderTop: '1px solid #eee', padding: '10px', gap: '10px' }}>
        <input 
          type="text" placeholder="Peça ideias, roteiros..." required disabled={chatLoading}
          value={chatMessage} onChange={(e) => setChatMessage(e.target.value)}
          style={{ flex: 1, padding: '12px', borderRadius: '4px', border: '1px solid #ccc', outline: 'none' }}
        />
        <button type="submit" disabled={chatLoading} style={{ padding: '12px 24px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: chatLoading ? 'not-allowed' : 'pointer' }}>
          Enviar
        </button>
      </form>
    </section>
  );
}