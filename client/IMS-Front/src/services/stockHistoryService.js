import api from './axiosInstance';

/* ── TransactionType enum (mirrors backend) ──────────────────────────────── */
export const TransactionType = { IN: 0, OUT: 1, ADJUSTMENT: 2 };
export const TxTypeName = { 0: 'IN', 1: 'OUT', 2: 'ADJUSTMENT' };

/* ── Normalizer ──────────────────────────────────────────────────────────── */
const normalize = (h) => ({
  id:           h.id,
  productId:    h.productId,
  supplierId:   h.supplierId   || null,
  productName:  h.product?.productName || h.productName || '',
  supplierName: h.supplier?.name       || h.supplierName || '',
  quantity:     h.quantity,
  type:         h.type,                        // 0 | 1 | 2
  typeName:     TxTypeName[h.type] ?? 'IN',    // 'IN' | 'OUT' | 'ADJUSTMENT'
  notes:        h.notes      || '',
  createdBy:    h.createdBy  || '',
  createdAt:    h.createdAt,
});

const unwrapList = (resData) => {
  const inner = resData?.data;
  const rows  = inner?.data ?? inner ?? [];
  return {
    items:      Array.isArray(rows) ? rows.map(normalize) : [],
    totalCount: inner?.totalCount ?? rows.length,
  };
};

/* ── Service ─────────────────────────────────────────────────────────────── */
const stockHistoryService = {
  /**
   * GET /api/stockhistory
   * Params: ProductId, SupplierId, Type (0|1|2), FromDate, ToDate, pageNumber, pageSize
   */
  getAll: async (params = {}) => {
    const res = await api.get('/stockhistory', { params });
    return unwrapList(res.data);
  },

  /** GET /api/stockhistory/:id */
  getById: async (id) => {
    const res = await api.get(`/stockhistory/${id}`);
    return normalize(res.data.data);
  },

  /**
   * POST /api/stockhistory
   * Records an IN / OUT / ADJUSTMENT — automatically updates Product.CurrentStock
   * OUT is rejected server-side if stock is insufficient.
   */
  create: async ({ productId, supplierId, quantity, type, notes }) => {
    const res = await api.post('/stockhistory', {
      productId,
      supplierId: supplierId || null,
      quantity:   Number(quantity),
      type,      // 0=IN, 1=OUT, 2=ADJUSTMENT
      notes:     notes || '',
    });
    return normalize(res.data.data);
  },
};

export default stockHistoryService;
