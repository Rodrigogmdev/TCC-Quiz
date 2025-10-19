import './styles/main.scss';
import Header from './components/Header';
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import FAQ from './pages/Faq';
import Auth from './pages/Auth';
import Review from './pages/Review'; 
import Post from './pages/Post';
import { useState } from 'react';
import { useAuth } from './context/AuthContext';

import { Routes, Route, useNavigate } from 'react-router-dom';

interface Questao {
  id: number;
  pergunta: string;
  alternativas: string[];
}

function App() {  
  const [numberOfQuestions, setNumberOfQuestions] = useState(0);
  const [difficultyLevel, setDifficultyLevel] = useState(0);
  const [erros, setErros] = useState<Questao[]>([]); 

  const { isLoggedIn, isAdmin, login, logout } = useAuth();

  const navigate = useNavigate();
  
  const handleStartQuiz = (num: number) => {
    setNumberOfQuestions(num);
    setErros([]); 
    navigate('/quiz'); 
  };

  const handleQuizComplete = () => {
    setDifficultyLevel(0);
    navigate('/'); 
  };

  const handleReviewErrors = (questoesErradas: Questao[]) => {
    setErros(questoesErradas);
    navigate('/review'); 
  };

  const handleLoginSuccess = async (token: string) => {
    let adminStatus = false;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, { 
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const userData = await response.json();
        adminStatus = userData.is_admin;
      }
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
    }
    login(token, adminStatus);
    navigate('/'); 
  };
  

  const handleLogout = () => {
    logout(); 
    navigate('/');
    navigate('/'); 
  };

   return (
    <>
      <Header
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin} 
        onLogout={handleLogout}
      />
      
      <div className="container">
        <Routes>
          <Route 
            path="/" 
            element={
              <Home
                onStartQuiz={handleStartQuiz}
                setDifficultyLevel={setDifficultyLevel}
                isLoggedIn={isLoggedIn}
              />
            } 
          />
          <Route 
            path="/quiz" 
            element={
              <Quiz
                numberOfQuestions={numberOfQuestions}
                difficultyLevel={difficultyLevel}
                onQuizComplete={handleQuizComplete}
                onReviewErrors={handleReviewErrors} 
              />
            } 
          />
          <Route 
            path="/review" 
            element={
              <Review
                erros={erros}
                onFinishReview={handleQuizComplete}
              />
            } 
          />
          <Route 
            path="/faq" 
            element={<FAQ onNavigateToHome={() => navigate('/')} />} 
          />
          <Route 
            path="/auth" 
            element={
              <Auth 
                onLoginSuccess={handleLoginSuccess} 
                onNavigateToHome={() => navigate('/')} 
              />
            } 
          />
          <Route 
            path="/post" 
            element={<Post />} 
          />
          <Route path="*" element={<h2>Página não encontrada</h2>} />
        </Routes>
      </div>
    </>
  );
}

export default App;