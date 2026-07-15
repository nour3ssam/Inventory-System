import api from './axiosInstance';

/* ── Normalizer ──────────────────────────────────────────────────────────── */
const normalize = (s) => ({
  id:            s.id,
  name:          s.name,
  email:         s.email   || '',
  phone:         s.phone   || '',
  address:       s.address || '',
  // Backend Supplier has no code / contactPerson / rating / description
  // Commenting out mock UI-only defaults as requested
  /*
  code:          s.code          || `SUP-${s.name?.slice(0, 3).toUpperCase()}`,
  contactPerson: s.contactPerson || '',
  rating:        s.rating        ?? 4.5,
  status:        s.status        || 'Active',
  description:   s.description  || '',
  */
  createdAt:     s.createdAt,
  lastUpdated:   s.updatedAt || s.createdAt,
});

const unwrapList = (resData) => {
  const inner = resData?.data;
  const rows  = inner?.data ?? inner ?? [];
  return Array.isArray(rows) ? rows.map(normalize) : [];
};

/* ── Service ─────────────────────────────────────────────────────────────── */
const supplierService = {
  /** GET /api/supplier */
  getAll: async (params = {}) => {
    const res = await api.get('/supplier', { params });
    return unwrapList(res.data);
  },

  /** GET /api/supplier/:id */
  getById: async (id) => {
    const res = await api.get(`/supplier/${id}`);
    return normalize(res.data.data);
  },

  /** POST /api/supplier  — only backend fields sent */
  create: async (sup) => {
    const res = await api.post('/supplier', {
      name:    sup.name,
      email:   sup.email   || '',
      phone:   sup.phone   || '',
      address: sup.address || '',
    });
    // Remove UI-only fields merge back
    return { ...normalize(res.data.data), id: res.data.data.id };
  },

  /** PUT /api/supplier */
  update: async (sup) => {
    const res = await api.put('/supplier', {
      id:      sup.id,
      name:    sup.name,
      email:   sup.email   || '',
      phone:   sup.phone   || '',
      address: sup.address || '',
    });
    return { ...normalize(res.data.data), id: res.data.data.id };
  },

  /** DELETE /api/supplier/:id */
  delete: async (id) => {
    await api.delete(`/supplier/${id}`);
    return id;
  },
};

export default supplierService;
