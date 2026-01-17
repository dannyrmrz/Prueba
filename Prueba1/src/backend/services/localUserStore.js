const LOCAL_USERS_KEY = 'localUsers';
const TOKEN_KEY = 'authToken';
const SESSION_KEY = 'authSession';

const normalizeEmail = (email = '') => email.trim().toLowerCase();
const fallbackNameFromEmail = (email = '') => {
  const [localPart] = email.split('@');
  return localPart ? localPart.charAt(0).toUpperCase() + localPart.slice(1) : 'User';
};

const readUsers = () => {
  try {
    const stored = localStorage.getItem(LOCAL_USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('No se pudieron leer los usuarios locales:', error);
    return [];
  }
};

const writeUsers = (users) => localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));

const persistSession = ({ user, token }) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(SESSION_KEY, JSON.stringify({ user, token }));
};

export const getStoredSession = () => {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn('No se pudo leer la sesión almacenada:', error);
    return null;
  }
};

export const clearStoredSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
};

export const registerLocalUser = ({ name = '', email, password }) => {
  const normalizedEmail = normalizeEmail(email);
  const users = readUsers();
  if (users.some((u) => normalizeEmail(u.email) === normalizedEmail)) {
    throw new Error('Ese email ya existe.');
  }
  const safeName = name.trim() || fallbackNameFromEmail(normalizedEmail);
  users.push({ name: safeName, email: normalizedEmail, password });
  writeUsers(users);
};

export const ensureDemoUser = () => {
  const users = readUsers();
  const demoEmail = normalizeEmail('admin@tora.vc');
  const exists = users.some((user) => normalizeEmail(user.email) === demoEmail);
  if (!exists) {
    users.push({ name: 'Admin User', email: demoEmail, password: 'admin123' });
    writeUsers(users);
  }
};

export const authenticateLocalUser = ({ email, password }) => {
  const users = readUsers();
  const normalizedEmail = normalizeEmail(email);
  const user = users.find(
    (u) => normalizeEmail(u.email) === normalizedEmail && u.password === password
  );
  if (!user) {
    throw new Error('Credenciales inválidas.');
  }
  const token = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  const session = {
    user: {
      email: user.email,
      name: user.name || fallbackNameFromEmail(user.email)
    },
    token
  };
  persistSession(session);
  return session;
};