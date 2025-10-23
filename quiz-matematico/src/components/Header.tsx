import { Link } from 'react-router-dom';

interface HeaderProps {
  isLoggedIn: boolean;
  isAdmin: boolean;
  onLogout: () => void;
}

const Header = ({ isLoggedIn, isAdmin, onLogout }: HeaderProps) => {
  return (
    <header className="header-container">
      <div className="header-content">
        <div className="header-title">
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h3>Quiz de Conjuntos</h3>
          </Link>
        </div>
        <nav className="header-nav">
          <Link to="/faq" className="nav-button">
            FAQ
          </Link>
          {isAdmin && (
            <Link to="/post" className="nav-button">
              Postar
            </Link>
          )}

          {isLoggedIn ? (
            <button className="nav-button" onClick={onLogout}>
              Sair
            </button>
          ) : (
            <Link to="/auth" className="nav-button">
              Entrar / Cadastrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;