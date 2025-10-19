import { useState } from 'react';

interface ChatbotProps {
  questaoId: number;
}

interface ChatMessage {
  type: 'user' | 'bot';
  text: string;
}

const Chatbot = ({ questaoId }: ChatbotProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = { type: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questao_id: questaoId,
          pergunta_usuario: input,
        }),
      });

      if (!response.ok) {
        throw new Error('Não foi possível obter uma resposta.');
      }

      const data = await response.json();
      const botMessage: ChatMessage = { type: 'bot', text: data.resposta_chatbot };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      const errorMessage: ChatMessage = { type: 'bot', text: 'Desculpe, estou com problemas para me conectar. Tente novamente mais tarde.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h4>Precisa de uma dica?</h4>
      </div>
      <div className="chatbot-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`}>
            <p>{msg.text}</p>
          </div>
        ))}
        {isLoading && <div className="message bot"><p>Pensando...</p></div>}
      </div>
      <form className="chatbot-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua dúvida aqui..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>Enviar</button>
      </form>
    </div>
  );
};

export default Chatbot;