interface HeaderProps {
  isLoggedIn: boolean;
  isAdmin: boolean;
  onNavigateToAuth: () => void;
  onNavigateToFaq: () => void;
  onNavigateToPost: () => void;
  onLogout: () => void;
}

const Header = ({ isLoggedIn, isAdmin, onNavigateToAuth, onNavigateToFaq, onNavigateToPost, onLogout }: HeaderProps) => {
  return (
    <header className="header-container">
      <div className="header-content">
        <div className="header-title">
          <h3>Quiz de Conjuntos</h3>
        </div>
        <nav className="header-nav">
          <button className="nav-button" onClick={onNavigateToFaq}>
            FAQ
          </button>
          {isAdmin && (
            <button className="nav-button" onClick={onNavigateToPost}>
              Postar
            </button>
          )}
          {isLoggedIn ? (
            <button className="button" onClick={onLogout}>
              Sair
            </button>
          ) : (
            <button className="button" onClick={onNavigateToAuth}>
              Entrar / Cadastrar
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;