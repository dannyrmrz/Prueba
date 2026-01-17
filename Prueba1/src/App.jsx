import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import LoginScreen from './frontend/pages/Login/LoginScreen';
import SignUpScreen from './frontend/pages/SignUp/SignUpScreen';
import DashboardScreen from './frontend/pages/Dashboard/DashboardScreen';
import ProjectsScreen from './frontend/pages/Projects/ProjectsScreen';

const AppRoutes = () => {
  const location = useLocation();
  const isFullBleed =
    location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/projects');

  return (
    <div className={`app-shell ${isFullBleed ? 'app-shell--fluid' : ''}`}>
      <Routes>
        <Route path="/" element={<LoginScreen />} />
        <Route path="/signup" element={<SignUpScreen />} />
        <Route path="/dashboard" element={<DashboardScreen />} />
        <Route path="/projects" element={<ProjectsScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
