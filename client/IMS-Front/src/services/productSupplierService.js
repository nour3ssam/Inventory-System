import api from './axiosInstance';

/* ── Normalizers ─────────────────────────────────────────────────────────── */
const normalizePair = (ps) => ({
  id:        ps.id,
  productId: ps.productId,
  supplierId: ps.supplierId,
  costPrice:  ps.costPrice,
  productName:  ps.product?.productName  || '',
  supplierName: ps.supplier?.name        || '',
});

/* ── Service ─────────────────────────────────────────────────────────────── */
const productSupplierService = {
  /** GET /api/productsupplier/product/:productId — suppliers for a product */
  getSuppliersByProduct: async (productId, params = {}) => {
    const res = await api.get(`/productsupplier/product/${productId}`, { params });
    const rows = res.data?.data?.data ?? res.data?.data ?? [];
    return Array.isArray(rows) ? rows.map(normalizePair) : [];
  },

  /** GET /api/productsupplier/supplier/:supplierId — products for a supplier */
  getProductsBySupplier: async (supplierId, params = {}) => {
    const res = await api.get(`/productsupplier/supplier/${supplierId}`, { params });
    const rows = res.data?.data?.data ?? res.data?.data ?? [];
    return Array.isArray(rows) ? rows.map(normalizePair) : [];
  },

  /** POST /api/productsupplier — assign a supplier to a product */
  assign: async ({ productId, supplierId, costPrice }) => {
    const res = await api.post('/productsupplier', { productId, supplierId, costPrice: Number(costPrice) });
    return normalizePair(res.data.data);
  },

  /** PUT /api/productsupplier/cost-price — update cost price for a link */
  updateCostPrice: async ({ productId, supplierId, costPrice }) => {
    const res = await api.put('/productsupplier/cost-price', {
      productId, supplierId, costPrice: Number(costPrice),
    });
    return normalizePair(res.data.data);
  },

  /** DELETE /api/productsupplier/:productId/:supplierId */
  remove: async ({ productId, supplierId }) => {
    await api.delete(`/productsupplier/${productId}/${supplierId}`);
    return { productId, supplierId };
  },
};

export default productSupplierService;
