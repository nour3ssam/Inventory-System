import axios from 'axios';
import api from './axiosInstance';

const BASE_URL = 'https://localhost:7125/api/Auth';

/* ── Normalizer: backend UserDto → frontend user shape ───────────────────── */
const normalizeUser = (dto) => ({
  name:         dto.fullName  || dto.displayName || '',
  username:     dto.userName  || dto.username    || '',
  email:        dto.email     || '',
  role:         dto.role      || 'Operator',
  token:        dto.jWTAuth?.accessToken  || '',
  refreshToken: dto.jWTAuth?.refreshToken || '',
});

const clearLocalAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

const authService = {
  /** POST /api/auth/Login  — { email, password } */
  login: async ({ email, password }) => {
    const res = await axios.post(`${BASE_URL}/Login`, { email, password });
    const dto = res.data?.data;
    return normalizeUser(dto);
  },

  /**
   * POST /api/auth/Register
   * Backend expects: DisplayName, UserName, Email, PhoneNumber, Password, ConfirmPassword
   */
  register: async ({ name, username, email, phone, password, confirmPassword }) => {
    const res = await axios.post(`${BASE_URL}/Register`, {
      displayName:     name,
      userName:        username || email.split('@')[0],
      email,
      phoneNumber:     phone || '',
      password,
      confirmPassword: confirmPassword || password,
    });
    const dto = res.data?.data;
    return normalizeUser(dto);
  },

  /**
   * POST /api/Auth/Logout — requires Bearer + { accessToken, refreshToken }
   * Revokes the refresh token server-side, then clears local storage.
   */
  logout: async () => {
    const accessToken  = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      if (accessToken && refreshToken) {
        await api.post('/Auth/Logout', { accessToken, refreshToken });
      }
    } catch (_) {
      // Always clear local session even if revoke fails (expired / already revoked)
    }
    clearLocalAuth();
  },

  /** POST /api/auth/RefreshToken */
  refreshToken: async () => {
    const accessToken  = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    const res = await axios.post(`${BASE_URL}/RefreshToken`, { accessToken, refreshToken });
    const dto = res.data?.data;
    return normalizeUser(dto);
  },

  /** PUT /api/auth/Profile — update own account */
  updateProfile: async (data) => {
    const res = await api.put('/Auth/Profile', data);
    return res.data?.data;
  },

  /** DELETE /api/auth/Profile — delete own account */
  deleteAccount: async () => {
    await api.delete('/Auth/Profile');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken: () => localStorage.getItem('token'),
};

export default authService;
