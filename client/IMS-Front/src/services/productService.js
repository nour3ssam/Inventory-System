import api from './axiosInstance';

/* ── Field mapping helpers ───────────────────────────────────────────────── */

/** Backend ProductDto → frontend product shape */
const normalize = (p) => ({
  id:           p.id,
  name:         p.productName,
  sku:          p.sku          || '',
  barcode:      p.barcode      || '',
  description:  p.description  || '',
  category:     p.categoryName || '',
  categoryId:   p.categoryId,
  quantity:     p.currentStock,
  sellingPrice: p.sellingPrice,
  costPrice:    p.costPrice,
  unitPrice:    p.sellingPrice,          // kept for backwards-compat with UI
  reorderLevel:  p.reorderLevel,
  minStockLevel: p.minStockLevel,
  unit:          p.unitOfMeasurement || '',
  createdBy:     p.createdBy || 'System',
  createdAt:     p.createdAt,
});

/** Frontend product shape → backend CreateProductCommand / UpdateProductCommand */
const denormalize = (p) => ({
  productName:      p.name,
  sku:              p.sku          || '',
  barcode:          p.barcode      || '',
  description:      p.description  || '',
  sellingPrice:     Number(p.sellingPrice ?? p.unitPrice ?? 0),
  costPrice:        Number(p.costPrice ?? 0),
  currentStock:     Number(p.quantity ?? 0),
  reorderLevel:     Number(p.reorderLevel ?? 0),
  minStockLevel:    Number(p.minStockLevel ?? 0),
  unitOfMeasurement: p.unit || '',
  categoryId:       p.categoryId,
  createdBy:        p.createdBy || 'System',
});

/** Unwrap paginated response from backend */
const unwrapList = (resData) => {
  const inner = resData?.data;
  const rows  = inner?.data ?? inner ?? [];
  return {
    items:       Array.isArray(rows) ? rows.map(normalize) : [],
    totalCount:  inner?.totalCount  ?? rows.length,
    currentPage: inner?.currentPage ?? 1,
    totalPages:  inner?.totalPages  ?? 1,
  };
};

/* ── Service ─────────────────────────────────────────────────────────────── */
const productService = {
  /** GET /api/product?pageNumber=&pageSize=&search= */
  getAll: async (params = {}) => {
    const res = await api.get('/product', { params });
    return unwrapList(res.data);
  },

  /** GET /api/product/low-stock */
  getLowStock: async (params = {}) => {
    const res = await api.get('/product/low-stock', { params });
    const rows = res.data?.data?.data ?? res.data?.data ?? [];
    return Array.isArray(rows) ? rows.map(normalize) : [];
  },

  /** GET /api/product/:id */
  getById: async (id) => {
    const res = await api.get(`/product/${id}`);
    return normalize(res.data.data);
  },

  /** POST /api/product */
  create: async (product) => {
    const res = await api.post('/product', denormalize(product));
    return normalize(res.data.data);
  },

  /** PUT /api/product */
  update: async (product) => {
    const res = await api.put('/product', { id: product.id, ...denormalize(product) });
    return normalize(res.data.data);
  },

  /** DELETE /api/product/:id */
  delete: async (id) => {
    await api.delete(`/product/${id}`);
    return id;
  },
};

export default productService;
