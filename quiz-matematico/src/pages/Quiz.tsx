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
  difficultyLevel: number;
  onQuizComplete: () => void;
}

const Quiz = ({ numberOfQuestions, difficultyLevel, onQuizComplete }: QuizProps) => {
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestoes = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/questoes/?nivel=${difficultyLevel}&limit=${numberOfQuestions}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Erro ao buscar as questões.');
        }
        const data = await response.json();
        setQuestoes(data);
      } catch (error: any) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    };

    fetchQuestoes();
  }, [difficultyLevel, numberOfQuestions]);

  const avancarParaProximaQuestao = () => {
    setFeedback(null);
    if (currentQuestionIndex < questoes.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      onQuizComplete();
    }
  };

  const verificarResposta = async (resposta: string) => {
    const questaoAtual = questoes[currentQuestionIndex];
    if (!questaoAtual) return;

    setFeedback(null);

    const respostaAluno = parseInt(resposta, 10);
    if (isNaN(respostaAluno)) {
      console.error("A alternativa clicada não contém um número válido:", resposta);
      return;
    }

    const payload = {
      questao_id: questaoAtual.id,
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
        avancarParaProximaQuestao();
    }, 2000);

    } catch (error) {
      console.error('Falha ao chamar o backend:', error);
      setFeedback(false);
    }
  };

  const renderContent = () => {
    if (carregando) {
      return <p>Carregando questões...</p>;
    }
    if (erro) {
      return <p style={{ color: 'red' }}>Erro: {erro}</p>;
    }
    const questaoAtual = questoes[currentQuestionIndex];
    if (questaoAtual) {
      return (
        <>
          <QuizCard
            pergunta={questaoAtual.pergunta}
            alternativas={questaoAtual.alternativas}
            onResponder={verificarResposta}
          />
          <Feedback correta={feedback} />
        </>
      );
    }
    return <p>Nenhuma questão encontrada.</p>;
  };


  return (
    <div>
      {renderContent()}
    </div>
  );
};

export default Quiz;