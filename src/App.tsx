import { useState, useEffect } from 'react';
import { Auth } from './pages/Auth';
import { Chatbot } from './components/Chatbot';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('@GeraEntretenimento:token'));
  const [userName, setUserName] = useState<string>(localStorage.getItem('@GeraEntretenimento:userName') || 'Criador');
  const [activeTab, setActiveTab] = useState<'home' | 'chat'>('home');

  function handleAuthSuccess(newToken: string, userId: string, name: string) {
    localStorage.setItem('@GeraEntretenimento:token', newToken);
    localStorage.setItem('@GeraEntretenimento:userId', userId);
    localStorage.setItem('@GeraEntretenimento:userName', name);
    setToken(newToken);
    setUserName(name);
  }

  function handleLogout() {
    localStorage.clear();
    setToken(null);
    setActiveTab('home');
  }

  if (!token) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eaeaea', paddingBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px' }}>Studio</h1>
          <p style={{ margin: '5px 0 0 0', color: '#666' }}>Criador: <strong>{userName.toLocaleUpperCase()}</strong></p>
        </div>
        <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Sair
        </button>
      </header>

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
          <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #eee' }}>
            <h3 style={{ marginTop: 0 }}>Bem-vindo ao Dope AI Studio</h3>
            <p>Estamos em desenvolvimento... Se você estiver lendo isso, você é gay</p>
          </div>
        ) : (
          <Chatbot activeTab={activeTab} token={token} />
        )}
      </main>
    </div>
  );
}