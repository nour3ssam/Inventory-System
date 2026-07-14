import { combineReducers, configureStore } from '@reduxjs/toolkit';
import authReducer         from './authSlice';
import inventoryReducer    from './inventorySlice';
import categoryReducer     from './categorySlice';
import supplierReducer     from './supplierSlice';
import userReducer         from './userSlice';
import stockHistoryReducer from './stockHistorySlice';
import notificationReducer from './notificationSlice';

/** Clears cached domain data when switching accounts (logout / login / register). */
export const RESET_DOMAIN = 'app/resetDomain';
export const resetDomainData = () => ({ type: RESET_DOMAIN });

const appReducer = combineReducers({
  auth:          authReducer,
  inventory:     inventoryReducer,
  categories:    categoryReducer,
  suppliers:     supplierReducer,
  users:         userReducer,
  stockHistory:  stockHistoryReducer,
  notifications: notificationReducer,
});

const rootReducer = (state, action) => {
  if (action.type === RESET_DOMAIN) {
    // Drop domain caches; keep auth as-is (caller updates auth separately).
    state = { auth: state?.auth };
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
});
