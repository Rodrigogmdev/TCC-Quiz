import { useState, useEffect } from 'react';
import QuizCard from '../components/Quizcard';
import Feedback from '../components/feedback';

interface Questao {
  id: number;
  pergunta: string;
  alternativas: string[];
}

interface QuizProps {
  numberOfQuestions: number;
  onQuizComplete: () => void;
}

const Quiz = ({ numberOfQuestions, onQuizComplete }: QuizProps) => {
  const [questao, setQuestao] = useState<Questao | null>(null);
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  const buscarNovaQuestao = async () => {
    if (questionsAnswered >= numberOfQuestions) {
      onQuizComplete();
      return;
    }
    setCarregando(true);
    setErro(null);
    setFeedback(null);
    setQuestao(null);
    try {
      const questaoId = Math.floor(Math.random() * 20) + 1; 
      const response = await fetch(`http://127.0.0.1:8000/questoes/${questaoId}`);
      if (!response.ok) {
        throw new Error('Falha ao buscar a questão. O backend está rodando?');
      }
      const data: Questao = await response.json();
      setQuestao(data);
    } catch (error: any) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarNovaQuestao();
  }, [questionsAnswered]);

  const verificarResposta = async (resposta: string) => {
    if (!questao) return;

    setCarregando(true);
    setFeedback(null);

    const respostaAluno = parseInt(resposta, 10);
    if (isNaN(respostaAluno)) {
      console.error("A alternativa clicada não contém um número válido:", resposta);
      setCarregando(false);
      return;
    }

    const payload = {
      questao_id: questao.id,
      resposta_aluno: respostaAluno,
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/verificar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.statusText}`);
      }
      const data = await response.json();
      setFeedback(data.correta);

      setTimeout(() => {
        setQuestionsAnswered(prev => prev + 1);
      }, 2000);

    } catch (error) {
      console.error('Falha ao chamar o backend:', error);
      setFeedback(false);
    }
  };
  
  const renderContent = () => {
    if (carregando && !questao) {
      return <p>Carregando questão...</p>;
    }
    if (erro) {
      return <p style={{ color: 'red' }}>Erro: {erro}</p>;
    }
    if (questao) {
      return (
        <>
          <QuizCard
            pergunta={questao.pergunta}
            alternativas={questao.alternativas}
            onResponder={verificarResposta}
          />
          {carregando && feedback === null && <p>Verificando...</p>}
          <Feedback correta={feedback} />
        </>
      );
    }
    return null;
  };

  return (
    <div>
      {renderContent()}
    </div>
  );
};

export default Quiz;