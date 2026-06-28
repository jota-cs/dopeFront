import { useState, type FormEvent } from 'react';
import { api } from '../services/api';

interface AuthProps {
  onAuthSuccess: (token: string, userId: string, userName: string) => void;
}

export function Auth({ onAuthSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAuth(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      if (isLogin) {
        const response = await api.post<{ user: { id: string; name: string }; token: string }>('/sessions', { email, password });
        onAuthSuccess(response.token, response.user.id, response.user.name);
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

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '400px', margin: '100px auto', border: '1px solid #eee', borderRadius: '8px', boxHighlight: '0 4px 12px rgba(0,0,0,0.05)' }}>
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