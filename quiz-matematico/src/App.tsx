import './styles/main.scss';
import Header from './components/Header';
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import FAQ from './pages/Faq';
import Auth from './pages/Auth';
import Review from './pages/Review'; 
import Post from './pages/Post';
import { useState } from 'react';


interface Questao {
  id: number;
  pergunta: string;
  alternativas: string[];
}

type CurrentPage = 'home' | 'quiz' | 'faq' | 'auth' | 'review' | 'post';

function App() {
  const [currentPage, setCurrentPage] = useState<CurrentPage>('home');
  const [numberOfQuestions, setNumberOfQuestions] = useState(0);
  const [difficultyLevel, setDifficultyLevel] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
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
  const navigateToPost = () => setCurrentPage('post');

  const handleLoginSuccess = async (token: string) => {
    setAuthToken(token);
    setIsLoggedIn(true);
    localStorage.setItem('authToken', token);
  try {
      const response = await fetch('http://127.0.0.1:8000/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const userData = await response.json();
        setIsAdmin(userData.is_admin); 
      }
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
    }

    setCurrentPage('home');
  };
  

const handleLogout = () => {
    setAuthToken(null);
    setIsLoggedIn(false);
    setIsAdmin(false); 
    localStorage.removeItem('authToken');
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
      case 'post':
        return <Post />;
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
        isAdmin={isAdmin} 
        onNavigateToAuth={navigateToAuth}
        onLogout={handleLogout}
        onNavigateToFaq={navigateToFaq}
        onNavigateToPost={navigateToPost} 
      />
      
      <div className="container">
        {renderCurrentPage()}
      </div>
    </>
  );
}

export default App;