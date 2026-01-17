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
        <div className="dashboard-content__body">
          <div className="dashboard-summary">
            <p className="dashboard-summary__eyebrow">Projects</p>
            <h1 className="dashboard-summary__title">Projects hub</h1>
            <p className="dashboard-summary__copy">
              POR HACER
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ProjectsScreen;
