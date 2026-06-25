import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { api } from './utils/api';

// Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Sites from './pages/Sites';
import SiteDetails from './pages/SiteDetails';
import Alerts from './pages/Alerts';
import Pricing from './pages/Pricing';

// Protected Route Wrapper
function ProtectedLayout() {
  const isAuth = api.isAuthenticated();

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Dashboard Layout */}
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/sites" element={<Sites />} />
        <Route path="/sites/:id" element={<SiteDetails />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/pricing" element={<Pricing />} />
      </Route>

      {/* Catch-all Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
