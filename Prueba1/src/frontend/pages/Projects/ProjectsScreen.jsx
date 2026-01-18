import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar/Sidebar';
import '../Dashboard/DashboardScreen.css';

const ProjectsScreen = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <main className="dashboard-layout">
      <Sidebar
        user={user}
        currentPath={location.pathname}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      <section className="dashboard-content">
        <header className="dashboard-header">
          <h1 className="dashboard-header__title">Projects</h1>
          <p className="dashboard-header__subtitle">
            Manage and view all projects
          </p>
        </header>

        <div className="dashboard-state">
          POR HACER
        </div>
      </section>
    </main>
  );
};

export default ProjectsScreen;
