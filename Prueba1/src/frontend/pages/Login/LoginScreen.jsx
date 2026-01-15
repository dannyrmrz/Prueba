import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import ButtonForm from '../../components/ButtonForm/ButtonForm';
import ButtonText from '../../components/ButtonText/ButtonText';
import InputPassword from '../../components/Inputs/InputPassword';
import { useAuth } from '../../context/AuthContext';
import InputIcono from '../../components/Inputs/InputIcono';
import './LoginScreen.css';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      setErrorMessage('Por favor completa todos los campos.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await login({ email, password });
      console.info('Login local OK');
      window.location.href = '/dashboard';
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = () => {
    window.location.href = '/signup';
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <main className="login-screen">
      <div className="login-card" role="region" aria-label="Sign in form">
        <div className="login-card__badge" aria-hidden="true">
          <FontAwesomeIcon icon={faLock} />
        </div>
        <h1 className="login-card__title">Welcome Back</h1>
        <p className="login-card__subtitle">Sign in to your account</p>

        <section className="login-card__demo" aria-label="Demo credentials">
          <p className="login-card__demo-heading">Demo Credentials:</p>
          <div className="login-card__demo-item">
            <span>Email:</span>
            <span>admin@tora.vc</span>
          </div>
          <div className="login-card__demo-item">
            <span>Password:</span>
            <span>admin123</span>
          </div>
        </section>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-form__label" htmlFor="email">
            Email Address
          </label>
          <div className="input-control">
            <span className="input-control__icon" aria-hidden="true">
              <FontAwesomeIcon icon={faEnvelope} />
            </span>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="email@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <label className="login-form__label" htmlFor="password">
            Password
          </label>
          <InputPassword
            showPassword={showPassword}
            togglePasswordVisibility={togglePasswordVisibility}
            icono={faLock}
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            name="password"
            id="password"
            autoComplete="current-password"
            error={Boolean(errorMessage)}
          />

          {errorMessage ? <p className="login-form__error">{errorMessage}</p> : null}
            
          <ButtonForm
            type="submit"
            text={isSubmitting ? 'Signing In...' : 'Sign In'}
            disabled={isSubmitting}
          />
        </form>

        <div className="login-card__footer">
          <span>Don’t have an account?</span>
          <ButtonText label="Sign Up" onClick={handleSignUp} />
        </div>
      </div>
    </main>
  );
};

export default LoginScreen;
