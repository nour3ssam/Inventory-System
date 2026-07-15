import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import categoryService from '../services/categoryService';

/* ── Async Thunks ────────────────────────────────────────────────────────── */
export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try { return await categoryService.getAll(params); }
    catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
  },
);

/** addCategory — name kept for backwards compat with CategoryModal */
export const addCategory = createAsyncThunk(
  'categories/create',
  async (cat, { rejectWithValue }) => {
    try { return await categoryService.create(cat); }
    catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
  },
);

export const updateCategory = createAsyncThunk(
  'categories/update',
  async (cat, { rejectWithValue }) => {
    try { return await categoryService.update(cat); }
    catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
  },
);

export const deleteCategory = createAsyncThunk(
  'categories/delete',
  async (id, { rejectWithValue }) => {
    try { return await categoryService.delete(id); }
    catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
  },
);

/* ── Slice ───────────────────────────────────────────────────────────────── */
const categorySlice = createSlice({
  name: 'categories',
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
      .addCase(fetchCategories.pending, pending)
      .addCase(fetchCategories.fulfilled, (state, a) => {
        state.loading = false;
        state.items   = a.payload;
      })
      .addCase(fetchCategories.rejected, rejected)

      .addCase(addCategory.pending, pending)
      .addCase(addCategory.fulfilled, (state, a) => {
        state.loading = false;
        state.items.unshift(a.payload);
      })
      .addCase(addCategory.rejected, rejected)

      .addCase(updateCategory.pending, pending)
      .addCase(updateCategory.fulfilled, (state, a) => {
        state.loading = false;
        const idx = state.items.findIndex((i) => i.id === a.payload.id);
        if (idx !== -1) state.items[idx] = a.payload;
      })
      .addCase(updateCategory.rejected, rejected)

      .addCase(deleteCategory.pending, pending)
      .addCase(deleteCategory.fulfilled, (state, a) => {
        state.loading = false;
        state.items   = state.items.filter((i) => i.id !== a.payload);
      })
      .addCase(deleteCategory.rejected, rejected);
  },
});

export const { setSearchQuery, clearError } = categorySlice.actions;
export default categorySlice.reducer;
