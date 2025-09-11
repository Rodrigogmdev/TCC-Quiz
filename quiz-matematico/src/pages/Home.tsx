import { useState } from 'react';

interface HomeProps {
  onStartQuiz: (numberOfQuestions: number) => void;
  onNavigateToFaq: () => void;
  isLoggedIn: boolean; 
}

const Home = ({ onStartQuiz, onNavigateToFaq, isLoggedIn }: HomeProps) => {
  const [showOptions, setShowOptions] = useState(false);

  const handleStartClick = () => {
    setShowOptions(true);
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2>Bem-vindo ao Quiz de Conjuntos!</h2>
        <p>Teste seus conhecimentos sobre teoria dos conjuntos de uma forma divertida e interativa.</p>
      </div>

      {!showOptions ? (
        <div className="gerador-container">
          <button className="button" onClick={handleStartClick}>
            Começar novo quiz
          </button>
          <button className="button" onClick={onNavigateToFaq}>
            FAQ
          </button>
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <h3>Escolha a quantidade de questões</h3>
          <div className="botoes-geracao">
            <button className="button" onClick={() => onStartQuiz(5)}>
              5 Questões
            </button>
            <button className="button" onClick={() => onStartQuiz(10)}>
              10 Questões
            </button>
            <button className="button" onClick={() => onStartQuiz(15)}>
              15 Questões
            </button>
          </div>
          {/* Incentivo para Login */}
          {!isLoggedIn && (
            <p style={{ marginTop: '1rem', color: '#555' }}>
              Crie uma conta ou faça login para salvar seu progresso e acessar mais funcionalidades!
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;