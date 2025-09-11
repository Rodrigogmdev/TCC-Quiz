interface HeaderProps {
  isLoggedIn: boolean;
  onNavigateToAuth: () => void;
  onLogout: () => void;
}

const Header = ({ isLoggedIn, onNavigateToAuth, onLogout }: HeaderProps) => {
  return (
    <div className="header-container">
      <h1 style={{ textAlign: 'center' }}>Quiz de Conjuntos</h1>
      <div className="auth-actions">
        {isLoggedIn ? (
          <button className="button" onClick={onLogout}>
            Sair
          </button>
        ) : (
          <button className="button" onClick={onNavigateToAuth}>
            Entrar / Cadastrar
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;