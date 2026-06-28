const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = {
  async post<T>(endpoint: string, body: any): Promise<T> {
    // 1. Tenta buscar o token que guardamos no localStorage durante o login
    const token = localStorage.getItem('@GeraEntretenimento:token');

    // 2. Prepara os cabeçalhos padrão da requisição
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // 3. NOVIDADE: Se o token existir, injeta o cabeçalho Authorization exigido pelo Middleware
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers, // Envia os cabeçalhos atualizados
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao processar requisição.');
    }

    return response.json() as Promise<T>;
  },
    async get<T>(endpoint: string): Promise<T> {
  const token = localStorage.getItem('@GeraEntretenimento:token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, { method: 'GET', headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erro ao buscar dados.');
  }

  return response.json() as Promise<T>;
}
};