import { useState } from 'react';

interface AuthProps {
  onLoginSuccess: (token: string) => void;
  onNavigateToHome: () => void;
}

const Auth = ({ onLoginSuccess, onNavigateToHome }: AuthProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (isLogin) {
      // --- Lógica de Login ---
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      try {
        const response = await fetch('${import.meta.env.VITE_API_URL}/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || 'Falha no login.');
        }

        setMessage('Login bem-sucedido!');
        onLoginSuccess(data.access_token); // Chama a função do App.tsx

      } catch (error: any) {
        setMessage(error.message);
      }
    } else {
      // --- Lógica de Cadastro ---
      try {
        const response = await fetch('${import.meta.env.VITE_API_URL}/usuarios/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || 'Falha ao registrar.');
        }

        setMessage('Cadastro realizado com sucesso! Agora você pode fazer o login.');
        setIsLogin(true); // Muda para a tela de login após o cadastro

      } catch (error: any) {
        setMessage(error.message);
      }
    }
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? 'Login' : 'Cadastro'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Usuário</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="button" type="submit">
          {isLogin ? 'Entrar' : 'Cadastrar'}
        </button>
      </form>

      {message && <p className="feedback-message">{message}</p>}

      <button className="toggle-button" onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
      </button>
      <button className="button" onClick={onNavigateToHome} style={{marginTop: '1rem'}}>
        Voltar para o Início
      </button>
    </div>
  );
};

export default Auth;