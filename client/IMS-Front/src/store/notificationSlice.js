import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import notificationService from '../services/notificationService';

/* ── Async Thunks ────────────────────────────────────────────────────────── */
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try { return await notificationService.getAll(params); }
    catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
  },
);

export const fetchUnreadNotifications = createAsyncThunk(
  'notifications/fetchUnread',
  async (_, { rejectWithValue }) => {
    try { return await notificationService.getUnread(); }
    catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
  },
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (id, { rejectWithValue }) => {
    try { return await notificationService.markAsRead(id); }
    catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
  },
);

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try { await notificationService.markAllAsRead(); return true; }
    catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
  },
);

export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (id, { rejectWithValue }) => {
    try { return await notificationService.delete(id); }
    catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
  },
);

/* ── Slice ───────────────────────────────────────────────────────────────── */
const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items:       [],
    totalCount:  0,
    unreadCount: 0,
    loading:     false,
    error:       null,
    isPanelOpen: false,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    togglePanel: (state) => { state.isPanelOpen = !state.isPanelOpen; },
    closePanel: (state) => { state.isPanelOpen = false; },
  },
  extraReducers: (builder) => {
    const pending  = (state) => { state.loading = true; state.error = null; };
    const rejected = (state, a) => { state.loading = false; state.error = a.payload; };

    builder
      /* fetchAll */
      .addCase(fetchNotifications.pending, pending)
      .addCase(fetchNotifications.fulfilled, (state, a) => {
        state.loading     = false;
        state.items       = a.payload.items;
        state.totalCount  = a.payload.totalCount;
        state.unreadCount = a.payload.items.filter((n) => !n.isRead).length;
      })
      .addCase(fetchNotifications.rejected, rejected)

      /* fetchUnread */
      .addCase(fetchUnreadNotifications.pending, pending)
      .addCase(fetchUnreadNotifications.fulfilled, (state, a) => {
        state.loading     = false;
        state.unreadCount = a.payload.length;
      })
      .addCase(fetchUnreadNotifications.rejected, rejected)

      /* markRead */
      .addCase(markNotificationRead.fulfilled, (state, a) => {
        const n = state.items.find((i) => i.id === a.payload);
        if (n && !n.isRead) { n.isRead = true; state.unreadCount = Math.max(0, state.unreadCount - 1); }
      })

      /* markAllRead */
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items.forEach((n) => { n.isRead = true; });
        state.unreadCount = 0;
      })

      /* delete */
      .addCase(deleteNotification.fulfilled, (state, a) => {
        const removed = state.items.find((i) => i.id === a.payload);
        if (removed && !removed.isRead) state.unreadCount = Math.max(0, state.unreadCount - 1);
        state.items      = state.items.filter((i) => i.id !== a.payload);
        state.totalCount = Math.max(0, state.totalCount - 1);
      });
  },
});

export const { clearError, togglePanel, closePanel } = notificationSlice.actions;
export default notificationSlice.reducer;
