const LOCAL_USERS_KEY = 'localUsers';
const TOKEN_KEY = 'authToken';
const SESSION_KEY = 'authSession';

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

export const registerLocalUser = ({ email, password }) => {
  const users = readUsers();
  if (users.some((u) => u.email === email)) {
    throw new Error('Ese email ya existe.');
  }
  users.push({ email, password });
  writeUsers(users);
};

export const ensureDemoUser = () => {
  const users = readUsers();
  const exists = users.some((user) => user.email === 'admin@tora.vc');
  if (!exists) {
    users.push({ email: 'admin@tora.vc', password: 'admin123' });
    writeUsers(users);
  }
};

export const authenticateLocalUser = ({ email, password }) => {
  const users = readUsers();
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    throw new Error('Credenciales inválidas.');
  }
  const token = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  const session = { user: { email: user.email }, token };
  persistSession(session);
  return session;
};