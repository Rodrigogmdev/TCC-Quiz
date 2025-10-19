import { useState } from 'react';

interface HomeProps {
  onStartQuiz: (numberOfQuestions: number) => void;
  isLoggedIn: boolean;
  setDifficultyLevel: (level: number) => void; 
}

const Home = ({ onStartQuiz, isLoggedIn, setDifficultyLevel }: HomeProps) => {
  const [step, setStep] = useState<'initial' | 'difficulty' | 'quantity'>('initial');

  const handleStartClick = () => {
    setStep('difficulty');
  };
  
  const handleDifficultySelect = (level: number) => {
    setDifficultyLevel(level);
    setStep('quantity');
  };

  const renderStep = () => {
    switch (step) {
      case 'difficulty':
        return (
          <div style={{ textAlign: 'center' }}>
            <h3>Escolha o Nível de Dificuldade</h3>
            <div className="botoes-geracao">
              <button className="button" onClick={() => handleDifficultySelect(1)}>
                Nível 1
              </button>
              <button className="button" onClick={() => handleDifficultySelect(2)}>
                Nível 2
              </button>
              <button className="button" onClick={() => handleDifficultySelect(3)}>
                Nível 3
              </button>
            </div>
          </div>
        );
      case 'quantity':
        return (
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
          </div>
        );
      case 'initial':
      default:
        return (
          <div className="gerador-container">
            <button className="button" onClick={handleStartClick}>
              Começar novo quiz
            </button>
          </div>
        );
    }
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2>Bem-vindo ao Quiz de Conjuntos!</h2>
        <p>Teste seus conhecimentos sobre teoria dos conjuntos de uma forma divertida e interativa.</p>
      </div>
      
      {renderStep()}

      {step !== 'initial' && !isLoggedIn && (
        <p style={{ marginTop: '1rem', color: '#555' }}>
          Crie uma conta ou faça login para salvar seu progresso e acessar mais funcionalidades!
        </p>
      )}
    </div>
  );
};

export default Home;