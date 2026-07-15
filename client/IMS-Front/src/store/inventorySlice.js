import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productService from '../services/productService';

/* ── Async Thunks ────────────────────────────────────────────────────────── */
export const fetchProducts = createAsyncThunk(
  'inventory/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try { return await productService.getAll(params); }
    catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
  },
);

/** Kept as `addProduct` so existing components (ItemModal) need no import changes */
export const addProduct = createAsyncThunk(
  'inventory/create',
  async (product, { rejectWithValue }) => {
    try { return await productService.create(product); }
    catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
  },
);

export const updateProduct = createAsyncThunk(
  'inventory/update',
  async (product, { rejectWithValue }) => {
    try { return await productService.update(product); }
    catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
  },
);

export const deleteProduct = createAsyncThunk(
  'inventory/delete',
  async (id, { rejectWithValue }) => {
    try { return await productService.delete(id); }
    catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
  },
);

/* ── Slice ───────────────────────────────────────────────────────────────── */
const inventorySlice = createSlice({
  name: 'inventory',
  initialState: {
    items:       [],
    totalCount:  0,
    currentPage: 1,
    totalPages:  1,
    loading:     false,
    error:       null,
    filters: {
      search:    '',
      category:  'All',
      supplier:  'All',
      warehouse: 'All',
      status:    'All',
    },
    sortBy:    'name',
    sortOrder: 'asc',
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = { search: '', category: 'All', supplier: 'All', warehouse: 'All', status: 'All' };
    },
    setSorting: (state, action) => {
      if (state.sortBy === action.payload) {
        state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortBy    = action.payload;
        state.sortOrder = 'asc';
      }
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    const pending   = (state) => { state.loading = true; state.error = null; };
    const rejected  = (state, a) => { state.loading = false; state.error = a.payload; };

    builder
      /* fetchProducts */
      .addCase(fetchProducts.pending, pending)
      .addCase(fetchProducts.fulfilled, (state, a) => {
        state.loading     = false;
        state.items       = a.payload.items;
        state.totalCount  = a.payload.totalCount;
        state.currentPage = a.payload.currentPage;
        state.totalPages  = a.payload.totalPages;
      })
      .addCase(fetchProducts.rejected, rejected)

      /* addProduct (create) */
      .addCase(addProduct.pending, pending)
      .addCase(addProduct.fulfilled, (state, a) => {
        state.loading = false;
        state.items.unshift(a.payload);
        state.totalCount += 1;
      })
      .addCase(addProduct.rejected, rejected)

      /* updateProduct */
      .addCase(updateProduct.pending, pending)
      .addCase(updateProduct.fulfilled, (state, a) => {
        state.loading = false;
        const idx = state.items.findIndex((i) => i.id === a.payload.id);
        if (idx !== -1) state.items[idx] = a.payload;
      })
      .addCase(updateProduct.rejected, rejected)

      /* deleteProduct */
      .addCase(deleteProduct.pending, pending)
      .addCase(deleteProduct.fulfilled, (state, a) => {
        state.loading    = false;
        state.items      = state.items.filter((i) => i.id !== a.payload);
        state.totalCount = Math.max(0, state.totalCount - 1);
      })
      .addCase(deleteProduct.rejected, rejected);
  },
});

export const { setFilters, resetFilters, setSorting, clearError } = inventorySlice.actions;
export default inventorySlice.reducer;
