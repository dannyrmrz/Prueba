import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LoginScreen from './frontend/pages/Login/LoginScreen';
import SignUpScreen from './frontend/pages/SignUp/SignUpScreen';
import DashboardScreen from './frontend/pages/Dashboard/DashboardScreen';

function App() {
  return (
    <Router>
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<LoginScreen />} />
          <Route path="/signup" element={<SignUpScreen />} />
          <Route path="/dashboard" element={<DashboardScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
