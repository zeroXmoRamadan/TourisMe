const ANON_ID_KEY = 'tourisme_chat_anon_id';
const ANON_MESSAGES_PREFIX = 'tourisme_chat_anon_messages_';

// sessionStorage clears when the tab closes; survives refresh within the same tab
const storage = sessionStorage;

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

// Remove legacy localStorage keys from an earlier implementation
const cleanupLegacyStorage = () => {
  try {
    localStorage.removeItem(ANON_ID_KEY);
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(ANON_MESSAGES_PREFIX)) keysToRemove.push(key);
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch {
    // ignore
  }
};

cleanupLegacyStorage();

export const getAnonymousId = () => {
  let id = storage.getItem(ANON_ID_KEY);
  if (!id) {
    id = generateId();
    storage.setItem(ANON_ID_KEY, id);
  }
  return id;
};

const serializeMessages = (messages) =>
  messages.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp,
  }));

const deserializeMessages = (messages) =>
  messages.map((m) => ({
    ...m,
    timestamp: new Date(m.timestamp),
  }));

export const loadAnonymousHistory = () => {
  const anonId = getAnonymousId();
  const raw = storage.getItem(`${ANON_MESSAGES_PREFIX}${anonId}`);
  if (!raw) return [];
  try {
    return deserializeMessages(JSON.parse(raw));
  } catch {
    return [];
  }
};

export const saveAnonymousHistory = (messages) => {
  const anonId = getAnonymousId();
  storage.setItem(
    `${ANON_MESSAGES_PREFIX}${anonId}`,
    JSON.stringify(serializeMessages(messages))
  );
};

export const clearAnonymousHistory = () => {
  const anonId = getAnonymousId();
  storage.removeItem(`${ANON_MESSAGES_PREFIX}${anonId}`);
};
