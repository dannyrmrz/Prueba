import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import ButtonForm from '../../components/ButtonForm/ButtonForm';
import ButtonText from '../../components/ButtonText/ButtonText';
import InputPassword from '../../components/Inputs/InputPassword';
import InputIcono from '../../components/Inputs/InputIcono';
import { useAuth } from '../../context/AuthContext';
import './SignUpScreen.css';

const SignUpScreen = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showFieldErrors, setShowFieldErrors] = useState(false);
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSignIn = () => {
    navigate('/');
  };

  const resetMessages = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    resetMessages();

    if (!fullName || !email || !password) {
      setShowFieldErrors(true);
      setErrorMessage('Por favor completa todos los campos.');
      return;
    }

    setIsSubmitting(true);

    try {
      await register({ name: fullName, email, password });
      setSuccessMessage('Cuenta creada con éxito. Ahora puedes iniciar sesión.');
      setShowFieldErrors(false);
      setFullName('');
      setEmail('');
      setPassword('');
    } catch (error) {
      setErrorMessage(error?.message || 'No se pudo crear la cuenta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const highlightNameError = showFieldErrors && !fullName;
  const highlightEmailError = showFieldErrors && !email;
  const highlightPasswordError = showFieldErrors && !password;

  return (
    <main className="signup-screen">
      <div className="signup-card" role="region" aria-label="Sign up form">
        <div className="signup-card__badge" aria-hidden="true">
          <FontAwesomeIcon icon={faLock} />
        </div>
        <h1 className="signup-card__title">Create Account</h1>
        <p className="signup-card__subtitle">Sign up to get started</p>

        <form className="signup-form" onSubmit={handleSubmit}>
          <label className="signup-form__label" htmlFor="fullName">
            Full Name
          </label>
          <InputIcono
            icono={faUser}
            placeholder="John Doe"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            type="text"
            name="fullName"
            id="fullName"
            autoComplete="name"
            error={highlightNameError}
          />

          <label className="signup-form__label" htmlFor="email">
            Email Address
          </label>
          <InputIcono
            icono={faEnvelope}
            placeholder="email@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            name="email"
            id="email"
            autoComplete="email"
            error={highlightEmailError}
          />

          <label className="signup-form__label" htmlFor="password">
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
            autoComplete="new-password"
            error={highlightPasswordError}
          />

          {errorMessage ? <p className="signup-form__error">{errorMessage}</p> : null}
          {successMessage ? <p className="signup-form__success">{successMessage}</p> : null}

          <ButtonForm
            type="submit"
            text={isSubmitting ? 'Creating Account...' : 'Create Account'}
            disabled={isSubmitting}
          />
        </form>

        <div className="signup-card__footer">
          <ButtonText texto="Already have an account?" textoButton="Sign In" accion={handleSignIn} />
        </div>
      </div>
    </main>
  );
};

export default SignUpScreen;
