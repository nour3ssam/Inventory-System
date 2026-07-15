import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import stockHistoryService, { TransactionType } from '../services/stockHistoryService';

export { TransactionType };

/* ── Async Thunks ────────────────────────────────────────────────────────── */
export const fetchStockHistory = createAsyncThunk(
  'stockHistory/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try { return await stockHistoryService.getAll(params); }
    catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
  },
);

export const createStockEntry = createAsyncThunk(
  'stockHistory/create',
  async (entry, { rejectWithValue }) => {
    try { return await stockHistoryService.create(entry); }
    catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
  },
);

/* ── Slice ───────────────────────────────────────────────────────────────── */
const stockHistorySlice = createSlice({
  name: 'stockHistory',
  initialState: {
    items:      [],
    totalCount: 0,
    loading:    false,
    error:      null,
    filters: {
      productId:  null,
      supplierId: null,
      type:       null,   // 0 | 1 | 2 | null (all)
      fromDate:   '',
      toDate:     '',
    },
  },
  reducers: {
    setHistoryFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    const pending  = (state) => { state.loading = true; state.error = null; };
    const rejected = (state, a) => { state.loading = false; state.error = a.payload; };

    builder
      .addCase(fetchStockHistory.pending, pending)
      .addCase(fetchStockHistory.fulfilled, (state, a) => {
        state.loading    = false;
        state.items      = a.payload.items;
        state.totalCount = a.payload.totalCount;
      })
      .addCase(fetchStockHistory.rejected, rejected)

      .addCase(createStockEntry.pending, pending)
      .addCase(createStockEntry.fulfilled, (state, a) => {
        state.loading = false;
        state.items.unshift(a.payload);
        state.totalCount += 1;
      })
      .addCase(createStockEntry.rejected, rejected);
  },
});

export const { setHistoryFilters, clearError } = stockHistorySlice.actions;
export default stockHistorySlice.reducer;
