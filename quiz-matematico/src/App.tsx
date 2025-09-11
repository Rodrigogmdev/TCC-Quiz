import './styles/main.scss';
import Header from './components/Header';
import QuizCard from './components/Quizcard';
import Feedback from './components/feedback';
import { useState, useEffect } from 'react';

// Interface da questao
interface Questao {
  id: number; 
  pergunta: string;
  alternativas: string[];
  conjunto_a: number[];
  conjunto_b: number[];
  operacao: 'uniao' | 'interseccao' | 'diferenca';
}

function App() {
  const [questao, setQuestao] = useState<Questao | null>(null);
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true); // Começa carregando
  const [erro, setErro] = useState<string | null>(null);

  // Função para buscar uma nova questão do backend
  const buscarNovaQuestao = async () => {
    setCarregando(true);
    setErro(null);
    setFeedback(null);
    setQuestao(null);

    try {
      // Gera um ID aleatório de 1 a 5 para buscar uma das questões que você cadastrou
      const questaoId = Math.floor(Math.random() * 5) + 1;
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

  // useEffect para buscar a primeira questão quando o componente montar
  useEffect(() => {
    buscarNovaQuestao();
  }, []);

  // Função para  o backend  verificar a resposta
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
    } catch (error) {
      console.error('Falha ao chamar o backend:', error);
      setFeedback(false);
    } finally {
      setCarregando(false);
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
          {carregando && <p>Verificando...</p>}
          <Feedback correta={feedback} />
        </>
      );
    }
    return null;
  };

  return (
    <div className="container">
      <Header />
      {renderContent()}
      <div className="gerador-container">
        <button className="button" onClick={buscarNovaQuestao} disabled={carregando}>
          Nova Questão
        </button>
      </div>
    </div>
  );
}

export default App;