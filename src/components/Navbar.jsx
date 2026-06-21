import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

export default function Navbar() {
  const navigate = useNavigate();

  function handleLogout() {
    Cookies.remove('jwt_token');
    navigate('/login');
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand" aria-label="Go to dashboard home">
          Go Business
        </Link>
        <nav aria-label="Primary" className="nav-links">
          <Link to="/">Home</Link>
        </nav>
        <div className="navbar-actions">
          <button type="button" className="btn btn-primary">
            Try for free
          </button>
          <button type="button" className="btn btn-outline" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
