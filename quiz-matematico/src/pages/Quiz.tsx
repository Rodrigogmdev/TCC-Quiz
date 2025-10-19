import { useState, useEffect } from 'react';
import QuizCard from '../components/Quizcard';
import Feedback from '../components/Feedback';
import Chatbot from '../components/ChatBot';

interface Questao {
  id: number;
  pergunta: string;
  alternativas: string[];
}

interface QuizProps {
  numberOfQuestions: number;
  difficultyLevel: number;
  onQuizComplete: () => void;
  onReviewErrors: (erros: Questao[]) => void;
}

const Quiz = ({ numberOfQuestions, difficultyLevel, onQuizComplete, onReviewErrors }: QuizProps) => {
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);
  const [quizFinalizado, setQuizFinalizado] = useState(false);
  const [respostas, setRespostas] = useState<{ questao: Questao; correta: boolean }[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const fetchQuestoes = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/questoes/?nivel=${difficultyLevel}&limit=${numberOfQuestions}`);
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
      setQuizFinalizado(true);
    }
  };

  const verificarResposta = async (resposta: string) => {
    const questaoAtual = questoes[currentQuestionIndex];
    if (!questaoAtual) return;

    setFeedback(null);

    const payload = {
      questao_id: questaoAtual.id,
      resposta_aluno: resposta,
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/verificar`, {
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
      setRespostas([...respostas, { questao: questaoAtual, correta: data.correta }]);


       setTimeout(() => {
        avancarParaProximaQuestao();
    }, 2000);

    } catch (error) {
      console.error('Falha ao chamar o backend:', error);
      setFeedback(false);
      setRespostas([...respostas, { questao: questaoAtual, correta: false }]);
    }
  };

  const renderContent = () => {
    if (carregando) {
      return <p>Carregando questões...</p>;
    }
    if (erro) {
      return <p style={{ color: 'red' }}>Erro: {erro}</p>;
    }

    if (quizFinalizado) {
        const acertos = respostas.filter(r => r.correta).length;
        const erros = respostas.filter(r => !r.correta).map(r => r.questao);

        return (
            <div className="results-container" style={{ textAlign: 'center' }}>
                <h2>Quiz Finalizado!</h2>
                <p>Você acertou {acertos} de {questoes.length} questões.</p>
                <div className="botoes-geracao">
                    <button className="button" onClick={onQuizComplete}>Voltar ao Início</button>
                    {erros.length > 0 && (
                        <button className="button" onClick={() => onReviewErrors(erros)}>
                            Revisar erros
                        </button>
                    )}
                </div>
            </div>
        )
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

          {isChatOpen && <Chatbot questaoId={questaoAtual.id} />}
        </>
      );
    }
    return <p>Nenhuma questão encontrada.</p>;
  };

  return (
    <div>
      {renderContent()}
      {!carregando && !erro && !quizFinalizado && (
        <button 
          className="button chat-toggle-button" 
          onClick={() => setIsChatOpen(!isChatOpen)}
        >
          💬
        </button>
      )}

    </div>
  );
};

export default Quiz;