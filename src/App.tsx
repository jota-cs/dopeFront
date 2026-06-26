import { useState, useEffect, FormEvent } from 'react';
import { api } from './services/api';

interface UserData {
  id: string;
  name: string;
  email: string;
}

export default function App() {
  // Estados de navegação e autenticação
  const [token, setToken] = useState<string | null>(localStorage.getItem('@GeraEntretenimento:token'));
  const [user, setUser] = useState<UserData | null>(null);
  
  // Estados do formulário
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Efeito para simular a permanência do usuário logado se houver token
  useEffect(() => {
    if (token) {
      // Em uma aplicação real, aqui dispararíamos uma rota GET '/me' enviando o token no Header
      // Para este cenário de validação, decodificamos ou recuperamos o estado mockado do usuário
      setUser({
        id: "usr_internal",
        name: "Usuário Autenticado",
        email: email || "usuario@teste.com"
      });
    }
  }, [token]);

  async function handleAuth(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      if (isLogin) {
        // Rota de Login (Gera JWT)
        const response = await api.post<{ user: UserData; token: string }>('/sessions', { email, password });
        
        localStorage.setItem('@GeraEntretenimento:token', response.token);
        setToken(response.token);
        setUser(response.user);
      } else {
        // Rota de Cadastro
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

  function handleLogout() {
    localStorage.removeItem('@GeraEntretenimento:token');
    setToken(null);
    setUser(null);
    setMessage('');
  }

  // ========================================================
  // RENDERIZAÇÃO 1: TELA DA DASHBOARD (PÁGINA PRINCIPAL)
  // ========================================================
  if (token && user) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px', fontFamily: 'sans-serif' }}>
        {/* Cabeçalho da Dashboard */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eaeaea', paddingBottom: '20px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px' }}>Painel Geral</h1>
            <p style={{ margin: '5px 0 0 0', color: '#666' }}>Bem-vindo de volta, <strong>{user.name}</strong></p>
          </div>
          <button 
            onClick={handleLogout}
            style={{ padding: '8px 16px', background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Sair do Sistema
          </button>
        </header>

        {/* Conteúdo Principal */}
        <main style={{ marginTop: '30px' }}>
          <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #eee' }}>
            <h3 style={{ marginTop: 0 }}>Dados da sua Conta (Sessão Segura)</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><strong>ID da Conta:</strong> <code style={{ background: '#eee', padding: '2px 6px', borderRadius: '4px' }}>{user.id}</code></li>
              <li><strong>E-mail Ativo:</strong> {user.email}</li>
              <li><strong>Status do Token:</strong> <span style={{ color: '#52c41a', fontWeight: 'bold' }}>✓ Ativo e Armazenado</span></li>
            </ul>
          </div>

          <section style={{ marginTop: '40px' }}>
            <h3>Próximos Módulos do Ecossistema</h3>
            <p style={{ color: '#666' }}>Sua estrutura de API desacoplada está pronta para receber novas tabelas no Supabase.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
              <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
                <h4>🎬 Gerenciador de Conteúdos</h4>
                <p style={{ fontSize: '14px', color: '#666' }}>Módulo planejado para listagem, paginação estrita e cadastro de mídias.</p>
              </div>
              <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
                <h4>🔒 Logs de Acesso</h4>
                <p style={{ fontSize: '14px', color: '#666' }}>Histórico de segurança consumido de forma assíncrona.</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  // ========================================================
  // RENDERIZAÇÃO 2: TELA DE AUTENTICAÇÃO (LOGIN/CADASTRO)
  // ========================================================
  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '400px', margin: '100px auto', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <h2 style={{ textAlign: 'center', marginTop: 0 }}>{isLogin ? 'Efetuar Login' : 'Criar Nova Conta'}</h2>
      
      <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {!isLogin && (
          <input 
            type="text" placeholder="Nome Completo" required
            value={name} onChange={e => setName(e.target.value)}
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        )}
        <input 
          type="email" placeholder="E-mail" required
          value={email} onChange={e => setEmail(e.target.value)}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input 
          type="password" placeholder="Senha" required
          value={password} onChange={e => setPassword(e.target.value)}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        
        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '12px', cursor: 'pointer', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}
        >
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