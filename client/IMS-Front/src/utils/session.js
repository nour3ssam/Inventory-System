import { logout } from '../store/authSlice';
import { resetDomainData } from '../store/store';
import authService from '../services/authService';

/**
 * Full logout: revoke JWT refresh token on server, clear auth + domain caches.
 */
export const performLogout = async (dispatch) => {
  await authService.logout();
  dispatch(logout());
  dispatch(resetDomainData());
};

/**
 * Call before loginSuccess after login/register so the new session
 * never inherits the previous account's Redux inventory/notifications.
 */
export const prepareNewSession = (dispatch) => {
  dispatch(resetDomainData());
};
