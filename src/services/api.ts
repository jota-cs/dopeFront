const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = {
  async post<T>(endpoint: string, body: any): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao processar requisição.');
    }

    return response.json() as Promise<T>;
  }
};