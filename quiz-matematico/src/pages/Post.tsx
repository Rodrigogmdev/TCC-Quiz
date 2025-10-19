import { useState } from 'react';

const Post = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const questoes = JSON.parse(jsonInput);
      const token = localStorage.getItem('authToken'); // Assumindo que você salva o token no localStorage

      const response = await fetch(`${import.meta.env.VITE_API_URL}/questoes/batch/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(questoes),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Falha ao enviar questões.');
      }

      setMessage('Questões enviadas com sucesso!');
      setJsonInput('');
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro. Verifique o JSON e tente novamente.');
    }
  };

  return (
    <div className="admin-container">
      <h2>Página do Administrador</h2>
      <p>Cole o JSON com as novas questões abaixo:</p>
      <form onSubmit={handleSubmit}>
        <textarea
          rows={20}
          cols={80}
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder="Cole o JSON aqui..."
          required
        />
        <br />
        <button className="button" type="submit">
          Enviar Questões
        </button>
      </form>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default Post;