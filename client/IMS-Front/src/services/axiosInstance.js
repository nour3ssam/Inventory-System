import axios from 'axios';

const BASE_URL ='https://localhost:7125/api';

/* ── Shared instance ─────────────────────────────────────────────────────── */
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

/* ── Request: inject Bearer token ────────────────────────────────────────── */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

/* ── Response: auto-refresh on 401 ──────────────────────────────────────── */
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

const redirectToLogin = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) { redirectToLogin(); return Promise.reject(error); }

      if (isRefreshing) {
        return new Promise((resolve, reject) => failedQueue.push({ resolve, reject }))
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return api(original);
          })
          .catch((err) => Promise.reject(err));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/RefreshToken`, {
          accessToken: localStorage.getItem('token'),
          refreshToken,
        });
        const newToken = data.data?.jWTAuth?.accessToken;
        const newRefresh = data.data?.jWTAuth?.refreshToken;
        if (!newToken) throw new Error('No token in refresh response');
        localStorage.setItem('token', newToken);
        if (newRefresh) localStorage.setItem('refreshToken', newRefresh);
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        redirectToLogin();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
