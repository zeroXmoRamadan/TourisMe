import axios from 'axios';

const api = axios.create({
  baseURL: '/api', 
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const data = error.response?.data;

    // Suspended account: clear the httpOnly cookie via the logout endpoint, then
    // redirect to /login so AuthContext re-initialises to null on next load.
    if (error.response?.status === 403 && data?.suspended === true) {
      if (!window.location.pathname.includes('/login')) {
        try {
          // Best-effort logout (clears the httpOnly cookie server-side)
          await axios.post('/api/auth/logout', {}, { withCredentials: true });
        } catch (_) {
          // ignore – we're redirecting anyway
        }
        window.location.replace('/login?suspended=1');
        return new Promise(() => {}); // prevent further .catch handlers
      }
      
      // If we are already on login page, let the error propagate so the form can show it
      return Promise.reject(error);
    }

    // All other errors propagate normally
    return Promise.reject(error);
  }
);

export default api;
