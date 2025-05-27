import './styles/main.scss';
import Header from './components/header';
import QuizCard from './components/quizcard';
import Feedback from './components/feedback';
import { useState } from 'react';

function App() {
  const [questao, setQuestao] = useState({
    pergunta: '(FGV) Numa Universidade com N alunos, 80 estudam Física, 90 Biologia, 55 Química, 32 Biologia e Física, 23 Química e Física, 16 biologia e Química e 8 estudam nas 3 faculdades. Sabendo-se que esta Universidade somente mantém as 3 faculdades, quantos alunos estão matriculados na Universidade?',
    alternativas: ['{304}', '{162}', '{146}', '{154}','{N.D.A}'],
    correta: 'B',
  });
  const [respostaUsuario, setRespostaUsuario] = useState<string | null>(null);
  const [mostrarOpcoesGeracao, setMostrarOpcoesGeracao] = useState(false);

  const verificarResposta = (resposta: string) => {
    setRespostaUsuario(resposta);
  };

  const correta = respostaUsuario
    ? respostaUsuario === questao.alternativas[1]
    : null;

  return (
    <div className="container">
      <Header />
      <QuizCard
        pergunta={questao.pergunta}
        alternativas={questao.alternativas}
        onResponder={verificarResposta}
      />
      <Feedback correta={correta} />

      {/* Botão principal */}
      <div className="gerador-container">
        <button
          className="button"
          onClick={() => setMostrarOpcoesGeracao(!mostrarOpcoesGeracao)}
        >
          Gerar mais questões
        </button>

        {/* Opções de quantidade */}
        {mostrarOpcoesGeracao && (
          <div className="botoes-geracao">
            <button className="button">1 questão</button>
            <button className="button">3 questões</button>
            <button className="button">5 questões</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
