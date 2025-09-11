interface HeaderProps {
  isLoggedIn: boolean;
  onNavigateToAuth: () => void;
  onNavigateToFaq: () => void; // Adicionamos a navegação do FAQ aqui
  onLogout: () => void;
}

const Header = ({ isLoggedIn, onNavigateToAuth, onNavigateToFaq, onLogout }: HeaderProps) => {
  return (
    <header className="header-container">
      <div className="header-content"> {/* Adicionamos esta div como um wrapper */}
        <div className="header-title">
          <h3>Quiz de Conjuntos</h3>
        </div>
        <nav className="header-nav">
          <button className="nav-button" onClick={onNavigateToFaq}>
            FAQ
          </button>
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
      </div> {/* Fechamento da div wrapper */}
    </header>
  );
};

export default Header;