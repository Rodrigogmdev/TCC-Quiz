import './styles/main.scss';
import Header from './components/Header';
import QuizCard from './components/Quizcard';
import Feedback from './components/feedback';
import { useState } from 'react';

// 1. A interface da questão agora espelha a estrutura necessária para o backend.
interface Questao {
  pergunta: string;
  alternativas: string[]; // As alternativas ainda são strings para exibição
  conjunto_a: number[];
  conjunto_b: number[];
  operacao: 'uniao' | 'interseccao' | 'diferenca';
}

function App() {
  // 2. O estado da questão agora inclui os conjuntos e a operação.
  //    Isso simula como a IA geraria os dados para um problema.
  const [questao, setQuestao] = useState<Questao>({
    pergunta: 'Qual é o resultado da união entre os conjuntos A = {1, 2, 3} e B = {3, 4, 5}?',
    alternativas: ['{1, 2, 3, 4, 5}', '{3}', '{1, 2}', '{1, 2, 4, 5}'],
    conjunto_a: [1, 2, 3],
    conjunto_b: [3, 4, 5],
    operacao: 'uniao',
  });

  // 3. Novo estado para o feedback. Ele guardará o valor booleano (true/false) retornado pela API.
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [carregando, setCarregando] = useState<boolean>(false);

  // 4. Esta é a função assíncrona que chama seu backend.
  const verificarResposta = async (resposta: string) => {
    setCarregando(true);
    setFeedback(null); // Limpa o feedback anterior

    // Tenta converter a string de resposta (ex: "{1, 2, 3}") para um array de números
    let respostaFormatada: number[];
    try {
      respostaFormatada = JSON.parse(resposta.replace(/{/g, '[').replace(/}/g, ']'));
    } catch (error) {
      console.error("Erro ao formatar a resposta do aluno:", error);
      // Opcional: mostrar um erro para o usuário se o formato for inválido
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
      // IMPORTANTE: Substitua pela URL real do seu backend FastAPI quando estiver rodando.
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

      // 5. Atualiza o estado de feedback com a resposta do backend.
      setFeedback(data.correta);

    } catch (error) {
      console.error('Falha ao chamar o backend:', error);
      // Opcional: Mostrar uma mensagem de erro na tela para o usuário.
      setFeedback(false); // Considera como incorreto se a API falhar
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="container">
      <Header />
      <QuizCard
        pergunta={questao.pergunta}
        alternativas={questao.alternativas}
        onResponder={verificarResposta}
      />
      {/* 6. O componente Feedback agora é controlado pelo estado 'feedback' */}
      {carregando ? <p>Verificando...</p> : <Feedback correta={feedback} />}

      {/* O resto da sua lógica de geração de questões permanece igual */}
      {/* ... */}
    </div>
  );
}

export default App;