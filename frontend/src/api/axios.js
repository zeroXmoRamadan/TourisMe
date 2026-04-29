import axios from 'axios';

const api = axios.create({
  baseURL: '/api', 
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // We let the application handle 401s (e.g. AuthContext setting user to null)
    // instead of a hard redirect which causes infinite loops on load.
    return Promise.reject(error);
  }
);

export default api;