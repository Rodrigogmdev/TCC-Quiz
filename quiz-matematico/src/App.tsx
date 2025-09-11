import './styles/main.scss';
import Header from './components/Header';
import Home from './pages/Home'; // Caminho atualizado
import Quiz from './pages/Quiz'; // Caminho atualizado
import { useState } from 'react';

function App() {
  const [quizStarted, setQuizStarted] = useState(false);
  const [numberOfQuestions, setNumberOfQuestions] = useState(0);

  const handleStartQuiz = (num: number) => {
    setNumberOfQuestions(num);
    setQuizStarted(true);
  };

  const handleQuizComplete = () => {
    setQuizStarted(false);
    setNumberOfQuestions(0);
  };

  return (
    <div className="container">
      <Header />
      {!quizStarted ? (
        <Home onStartQuiz={handleStartQuiz} />
      ) : (
        <Quiz
          numberOfQuestions={numberOfQuestions}
          onQuizComplete={handleQuizComplete}
        />
      )}
    </div>
  );
}

export default App;