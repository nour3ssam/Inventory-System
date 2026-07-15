import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import supplierService from '../services/supplierService';

/* ── Async Thunks ────────────────────────────────────────────────────────── */
export const fetchSuppliers = createAsyncThunk(
  'suppliers/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try { return await supplierService.getAll(params); }
    catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
  },
);

/** addSupplier — name kept for backwards compat with SupplierModal */
export const addSupplier = createAsyncThunk(
  'suppliers/create',
  async (sup, { rejectWithValue }) => {
    try { return await supplierService.create(sup); }
    catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
  },
);

export const updateSupplier = createAsyncThunk(
  'suppliers/update',
  async (sup, { rejectWithValue }) => {
    try { return await supplierService.update(sup); }
    catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
  },
);

export const deleteSupplier = createAsyncThunk(
  'suppliers/delete',
  async (id, { rejectWithValue }) => {
    try { return await supplierService.delete(id); }
    catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
  },
);

/* ── Slice ───────────────────────────────────────────────────────────────── */
const supplierSlice = createSlice({
  name: 'suppliers',
  initialState: {
    items:       [],
    searchQuery: '',
    loading:     false,
    error:       null,
  },
  reducers: {
    setSearchQuery: (state, action) => { state.searchQuery = action.payload; },
    clearError:     (state)         => { state.error = null; },
  },
  extraReducers: (builder) => {
    const pending  = (state) => { state.loading = true; state.error = null; };
    const rejected = (state, a) => { state.loading = false; state.error = a.payload; };

    builder
      .addCase(fetchSuppliers.pending, pending)
      .addCase(fetchSuppliers.fulfilled, (state, a) => {
        state.loading = false;
        state.items   = a.payload;
      })
      .addCase(fetchSuppliers.rejected, rejected)

      .addCase(addSupplier.pending, pending)
      .addCase(addSupplier.fulfilled, (state, a) => {
        state.loading = false;
        state.items.unshift(a.payload);
      })
      .addCase(addSupplier.rejected, rejected)

      .addCase(updateSupplier.pending, pending)
      .addCase(updateSupplier.fulfilled, (state, a) => {
        state.loading = false;
        const idx = state.items.findIndex((i) => i.id === a.payload.id);
        if (idx !== -1) state.items[idx] = a.payload;
      })
      .addCase(updateSupplier.rejected, rejected)

      .addCase(deleteSupplier.pending, pending)
      .addCase(deleteSupplier.fulfilled, (state, a) => {
        state.loading = false;
        state.items   = state.items.filter((i) => i.id !== a.payload);
      })
      .addCase(deleteSupplier.rejected, rejected);
  },
});

export const { setSearchQuery, clearError } = supplierSlice.actions;
export default supplierSlice.reducer;
