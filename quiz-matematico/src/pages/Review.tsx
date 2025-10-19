import { useState, useEffect } from 'react';

interface Questao {
  id: number;
  pergunta: string;
  alternativas: string[];
}

interface ReviewProps {
  erros: Questao[];
  onFinishReview: () => void;
}

const Review = ({ erros, onFinishReview }: ReviewProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [explicacao, setExplicacao] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const fetchExplicacao = async () => {
      if (erros.length > 0) {
        setCarregando(true);
        const questaoAtual = erros[currentIndex];
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/gerar-explicacao`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ questao_id: questaoAtual.id }),
          });
          const data = await response.json();
          if (response.ok) {
            setExplicacao(data.explicacao);
          } else {
            setExplicacao('Não foi possível carregar a explicação.');
          }
        } catch (error) {
          setExplicacao('Erro ao conectar com o servidor.');
        } finally {
          setCarregando(false);
        }
      }
    };

    fetchExplicacao();
  }, [currentIndex, erros]);

  const handleProxima = () => {
    if (currentIndex < erros.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onFinishReview();
    }
  };

  if (erros.length === 0) {
    return (
      <div>
        <h2>Revisão de Erros</h2>
        <p>Você não cometeu nenhum erro. Parabéns!</p>
        <button className="button" onClick={onFinishReview}>Voltar ao Início</button>
      </div>
    );
  }

  const questaoAtual = erros[currentIndex];

  return (
    <div>
      <h2>Revisão de Erros</h2>
      <p><strong>Questão:</strong> {questaoAtual.pergunta}</p>
      
      {carregando ? (
        <p>Gerando explicação com IA...</p>
      ) : (
        <div className="explanation-box" style={{ whiteSpace: 'pre-wrap', background: '#2a2a2a', padding: '1rem', borderRadius: '8px', margin: '1rem 0' }}>
          <h4>Resolução:</h4>
          <p>{explicacao}</p>
        </div>
      )}

      <button className="button" onClick={handleProxima}>
        {currentIndex < erros.length - 1 ? 'Próxima Questão' : 'Finalizar Revisão'}
      </button>
    </div>
  );
};

export default Review;