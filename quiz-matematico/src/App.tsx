import './styles/main.scss';
import Header from './components/Header';
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import FAQ from './pages/Faq'; 
import { useState } from 'react';

type CurrentPage = 'home' | 'quiz' | 'faq';

function App() {
  const [currentPage, setCurrentPage] = useState<CurrentPage>('home');
  const [numberOfQuestions, setNumberOfQuestions] = useState(0);

  const handleStartQuiz = (num: number) => {
    setNumberOfQuestions(num);
    setCurrentPage('quiz');
  };

  const handleQuizComplete = () => {
    setCurrentPage('home');
    setNumberOfQuestions(0);
  };

  const navigateToHome = () => {
    setCurrentPage('home');
  };

  const navigateToFaq = () => {
    setCurrentPage('faq');
  };
  
  
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'quiz':
        return (
          <Quiz
            numberOfQuestions={numberOfQuestions}
            onQuizComplete={handleQuizComplete}
          />
        );
      case 'faq':
        return <FAQ onNavigateToHome={navigateToHome} />;
      case 'home':
      default:
        return <Home onStartQuiz={handleStartQuiz} onNavigateToFaq={navigateToFaq} />;
    }
  };

  return (
    <div className="container">
      <Header />
      {renderCurrentPage()}
    </div>
  );
}

export default App;