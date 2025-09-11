import React, { useState, useEffect } from 'react';
import QuizCard from '../components/Quizcard';
import Feedback from '../components/feedback';

// Interface da questao
interface Questao {
  id: number;
  pergunta: string;
  alternativas: string[];
  conjunto_a: number[];
  conjunto_b: number[];
  operacao: 'uniao' | 'interseccao' | 'diferenca';
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

  // Função para buscar uma nova questão do backend
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
      const questaoId = Math.floor(Math.random() * 15) + 1;
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

  // useEffect para buscar uma nova questão
  useEffect(() => {
    buscarNovaQuestao();
  }, [questionsAnswered]);

  // Função para verificar a resposta
  const verificarResposta = async (resposta: string) => {
    if (!questao) return;

    setCarregando(true);
    setFeedback(null);

    let respostaFormatada: number[];
    try {
      respostaFormatada = JSON.parse(resposta.replace(/{/g, '[').replace(/}/g, ']'));
    } catch (error) {
      console.error("Erro ao formatar a resposta do aluno:", error);
      setCarregando(false);
      return;
    }

    const payload = {
      resposta_aluno: respostaFormatada,
      conjunto_a: questao.conjunto_a,
      conjunto_b: questao.conjunto_b,
      operacao: questao.operacao,
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