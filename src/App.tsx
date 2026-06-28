import { useState, useEffect, type FormEvent } from 'react';
import { api } from './services/api';

interface UserData {
  id: string;
  name: string;
  email: string;
}

// Interface para estruturar o histórico de mensagens local do chat
interface Message {
  sender: 'user' | 'gemini';
  text: string;
}

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('@GeraEntretenimento:token'));
  const [user, setUser] = useState<UserData | null>(null);
  
  // Estados de navegação interna da Dashboard
  const [activeTab, setActiveTab] = useState<'home' | 'chat'>('home');

  // Estados do Chatbot
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([
    { sender: 'gemini', text: 'Olá! Sou o seu facilitador de conteúdo com IA. O que vamos criar hoje?' }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  
  // Estados do formulário de autenticação
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  if (token) {
    // Agora recuperamos o e-mail real do estado ou decodificamos a sessão
    setUser({
      id: localStorage.getItem('@GeraEntretenimento:userId') || "usr_internal",
      name: user?.name || "Usuário Autenticado",
      email: email || "usuario@teste.com"
    });
  }
}, [token]);

useEffect(() => {
    async function loadChatHistory() {
      // Só busca do banco se a aba clicada for a de 'chat' e o usuário estiver logado
      if (activeTab === 'chat' && token) {
        try {
          setChatLoading(true);
          
          // Faz a requisição GET para a nova rota de histórico da API
          const data = await api.get<any[]>('/chat/history');
          
          const formattedMessages: Message[] = [];
          
          // Mapeia o que veio do Supabase para o formato que o chat exibe na tela
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
  }, [activeTab, token]); // Monitora sempre que a aba mudar

  async function handleAuth(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      if (isLogin) {
        const response = await api.post<{ user: UserData; token: string }>('/sessions', { email, password });
        localStorage.setItem('@GeraEntretenimento:token', response.token);
        localStorage.setItem('@GeraEntretenimento:userId', response.user.id);
        setToken(response.token);
        setUser(response.user);
      } else {
        await api.post('/users', { name, email, password });
        setMessage('Cadastro realizado com sucesso! Mude para o Login.');
        setIsLogin(true);
        setName('');
      }
    } catch (error: any) {
      setMessage(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  // Função para enviar a mensagem do Chat para a API do Gemini
  async function handleSendMessage(event: FormEvent) {
    event.preventDefault();
    if (!chatMessage.trim() || chatLoading) return;

    const userPrompt = chatMessage;
    setChatMessage(''); // Limpa o input imediatamente (melhor UX)
    setChatLoading(true);

    // Adiciona a mensagem do usuário na tela imediatamente
    setChatHistory((prev) => [...prev, { sender: 'user', text: userPrompt }]);

    try {
      // Consome a rota que criamos no back-end
      const data = await api.post<{ response: string }>('/chat', { message: userPrompt });
      
      // Adiciona a resposta da IA na tela
      setChatHistory((prev) => [...prev, { sender: 'gemini', text: data.response }]);
    } catch (error: any) {
      setChatHistory((prev) => [...prev, { sender: 'gemini', text: `Erro de Conexão: ${error.message}` }]);
    } finally {
      setChatLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('@GeraEntretenimento:token');
    setToken(null);
    setUser(null);
    setActiveTab('home');
    setMessage('');
  }

  // ========================================================
  // RENDERIZAÇÃO: DASHBOARD (PÁGINA PRINCIPAL APÓS LOGIN)
  // ========================================================
  if (token && user) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px', fontFamily: 'sans-serif' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eaeaea', paddingBottom: '20px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px' }}>Painel do Criador</h1>
            <p style={{ margin: '5px 0 0 0', color: '#666' }}>Criador: <strong>{user.name}</strong></p>
          </div>
          <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Sair
          </button>
        </header>

        {/* Menu de Abas Internas */}
        <nav style={{ display: 'flex', gap: '15px', marginTop: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
          <button onClick={() => setActiveTab('home')} style={{ padding: '10px 20px', background: activeTab === 'home' ? '#0070f3' : '#f0f0f0', color: activeTab === 'home' ? '#fff' : '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Início
          </button>
          <button onClick={() => setActiveTab('chat')} style={{ padding: '10px 20px', background: activeTab === 'chat' ? '#0070f3' : '#f0f0f0', color: activeTab === 'chat' ? '#fff' : '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            💬 Chatbot Gemini AI
          </button>
        </nav>

        <main style={{ marginTop: '30px' }}>
          {activeTab === 'home' ? (
            /* SUB-TELA: HOME INICIAL */
            <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #eee' }}>
              <h3 style={{ marginTop: 0 }}>Status do Ecossistema</h3>
              <p>O ambiente está totalmente integrado de forma desacoplada. Use o menu acima para abrir o assistente de inteligência artificial.</p>
            </div>
          ) : (
            /* SUB-TELA: CHAT VISUAL DA IA */
            <section style={{ border: '1px solid #eee', borderRadius: '8px', display: 'flex', flexDirection: 'column', height: '450px', background: '#fff' }}>
              {/* Janela de Mensagens */}
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

              {/* Caixa de Entrada de Texto */}
              <form onSubmit={handleSendMessage} style={{ display: 'flex', borderTop: '1px solid #eee', padding: '10px', gap: '10px' }}>
                <input 
                  type="text" placeholder="Peça ideias, roteiros ou copys para o Gemini..." required disabled={chatLoading}
                  value={chatMessage} onChange={(e) => setChatMessage(e.target.value)}
                  style={{ flex: 1, padding: '12px', borderRadius: '4px', border: '1px solid #ccc', outline: 'none' }}
                />
                <button type="submit" disabled={chatLoading} style={{ padding: '12px 24px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: chatLoading ? 'not-allowed' : 'pointer' }}>
                  Enviar
                </button>
              </form>
            </section>
          )}
        </main>
      </div>
    );
  }

  // ========================================================
  // RENDERIZAÇÃO: TELA DE AUTENTICAÇÃO (LOGIN/CADASTRO)
  // ========================================================
  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '400px', margin: '100px auto', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <h2 style={{ textAlign: 'center', marginTop: 0 }}>{isLogin ? 'Efetuar Login' : 'Criar Nova Conta'}</h2>
      <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {!isLogin && (
          <input type="text" placeholder="Nome Completo" required value={name} onChange={e => setName(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
        )}
        <input type="email" placeholder="E-mail" required value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
        <input type="password" placeholder="Senha" required value={password} onChange={e => setPassword(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
        <button type="submit" disabled={loading} style={{ padding: '12px', cursor: 'pointer', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
          {loading ? 'Processando...' : isLogin ? 'Entrar' : 'Cadastrar'}
        </button>
      </form>
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button onClick={() => { setIsLogin(!isLogin); setMessage(''); }} style={{ background: 'none', border: 'none', color: '#0070f3', cursor: 'pointer', fontSize: '14px' }}>
          {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça Login'}
        </button>
      </div>
      {message && (
        <p style={{ marginTop: '20px', padding: '10px', borderRadius: '4px', background: message.startsWith('Erro') ? '#fff1f0' : '#f6ffed', color: message.startsWith('Erro') ? '#ff4d4f' : '#52c41a', fontWeight: 'bold', fontSize: '14px', textAlign: 'center', border: `1px solid ${message.startsWith('Erro') ? '#ffccc7' : '#b7eb8f'}` }}>
          {message}
        </p>
      )}
    </div>
  );
}