import './styles/main.scss';
import Header from './components/Header';
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import FAQ from './pages/Faq';
import Auth from './pages/Auth'; 
import { useState } from 'react';

type CurrentPage = 'home' | 'quiz' | 'faq' | 'auth';

function App() {
  const [currentPage, setCurrentPage] = useState<CurrentPage>('home');
  const [numberOfQuestions, setNumberOfQuestions] = useState(0);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);


  const handleStartQuiz = (num: number) => {
    setNumberOfQuestions(num);
    setCurrentPage('quiz');
  };

  const handleQuizComplete = () => {
    setCurrentPage('home');
    setNumberOfQuestions(0);
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
            onQuizComplete={handleQuizComplete}
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
            onNavigateToFaq={navigateToFaq}
            isLoggedIn={isLoggedIn} // Passar o estado de login
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