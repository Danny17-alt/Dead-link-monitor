import { NavLink } from 'react-router-dom';
import { api } from '../utils/api';

export default function Navbar() {
  const user = api.getUser() || { name: 'User', email: '' };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      api.logout();
    }
  };

  return (
    <>
      {/* Top Header for Mobile */}
      <header className="mobile-header">
        <div className="sidebar-logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          <span>DeadLink Monitor</span>
        </div>
        <button onClick={handleLogout} className="logout-btn" style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
          Log Out
        </button>
      </header>

      {/* Bottom Navigation for Mobile */}
      <nav className="mobile-nav">
        <ul className="mobile-nav-list">
          <li>
            <NavLink to="/" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} end>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="7" height="9" x="3" y="3" rx="1" />
                <rect width="7" height="5" x="14" y="3" rx="1" />
                <rect width="7" height="9" x="14" y="12" rx="1" />
                <rect width="7" height="5" x="3" y="16" rx="1" />
              </svg>
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/sites" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
              <span>Sites</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/alerts" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              <span>Alerts</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </>
  );
}
