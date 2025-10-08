import './styles/main.scss';
import Header from './components/Header';
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import FAQ from './pages/Faq';
import Auth from './pages/Auth';
import Review from './pages/Review'; 
import { useState } from 'react';


interface Questao {
  id: number;
  pergunta: string;
  alternativas: string[];
}

type CurrentPage = 'home' | 'quiz' | 'faq' | 'auth' | 'review'; 

function App() {
  const [currentPage, setCurrentPage] = useState<CurrentPage>('home');
  const [numberOfQuestions, setNumberOfQuestions] = useState(0);
  const [difficultyLevel, setDifficultyLevel] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [erros, setErros] = useState<Questao[]>([]); 
  const handleStartQuiz = (num: number) => {
    setNumberOfQuestions(num);
    setCurrentPage('quiz');
    setErros([]); 
  };

  const handleQuizComplete = () => {
    setCurrentPage('home');
    setDifficultyLevel(0);
  };

  const handleReviewErrors = (questoesErradas: Questao[]) => {
    setErros(questoesErradas);
    setCurrentPage('review');
  };

  const navigateToHome = () => setCurrentPage('home');
  const navigateToFaq = () => setCurrentPage('faq');
  const navigateToAuth = () => setCurrentPage('auth');

  const handleLoginSuccess = (token: string) => {
    setAuthToken(token);
    setIsLoggedIn(true);
    setCurrentPage('home'); 
  };

  const handleLogout = () => {
    setAuthToken(null);
    setIsLoggedIn(false);
    setCurrentPage('home');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'quiz':
        return (
          <Quiz
            numberOfQuestions={numberOfQuestions}
            difficultyLevel={difficultyLevel}
            onQuizComplete={handleQuizComplete}
            onReviewErrors={handleReviewErrors} 
          />
        );
      case 'review':
        return (
            <Review
                erros={erros}
                onFinishReview={handleQuizComplete}
            />
        );
      case 'faq':
        return <FAQ onNavigateToHome={navigateToHome} />;
      case 'auth':
        return <Auth onLoginSuccess={handleLoginSuccess} onNavigateToHome={navigateToHome} />;
      case 'home':
      default:
        return (
          <Home
            onStartQuiz={handleStartQuiz}
            setDifficultyLevel={setDifficultyLevel}
            onNavigateToFaq={navigateToFaq}
            isLoggedIn={isLoggedIn}
          />
        );
    }
  };

   return (
    <>
      <Header 
        isLoggedIn={isLoggedIn}
        onNavigateToAuth={navigateToAuth}
        onLogout={handleLogout}
        onNavigateToFaq={navigateToFaq}
      />
      
      <div className="container">
        {renderCurrentPage()}
      </div>
    </>
  );
}

export default App;