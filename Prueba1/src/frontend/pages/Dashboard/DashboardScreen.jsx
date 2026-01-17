import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ButtonForm from '../../components/ButtonForm/ButtonForm';
import { useAuth } from '../../context/AuthContext';
import './DashboardScreen.css';

const DashboardScreen = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <main className="dashboard-screen">
      <div className="dashboard-card">
        <h1>Welcome, {user?.name || user?.email}</h1>
        <p>{user?.email}</p>
        <p>You are now signed in locally. This is a placeholder dashboard.</p>
        <ButtonForm text="Sign Out" onClick={handleLogout} />
      </div>
    </main>
  );
};

export default DashboardScreen;
