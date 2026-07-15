import api from './axiosInstance';

/* ── Normalizer ──────────────────────────────────────────────────────────── */
const normalize = (n) => ({
  id:          n.id,
  title:       n.title,
  message:     n.message,
  type:        n.type,     // 'LowStock'|'OutOfStock'|'OverStock'|'Expired'|'Normal'
  priority:    n.priority,
  notes:       n.notes    || '',
  isRead:      n.isRead,
  productId:   n.productId  || null,
  productName: n.product?.productName || '',
  createdAt:   n.createdAt,
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
const notificationService = {
  /** GET /api/notification?pageNumber=&pageSize=&UnreadOnly= */
  getAll: async (params = {}) => {
    const res = await api.get('/notification', { params });
    return unwrapList(res.data);
  },

  /** GET /api/notification?UnreadOnly=true */
  getUnread: async () => {
    const res = await api.get('/notification', { params: { UnreadOnly: true } });
    const rows = res.data?.data?.data ?? res.data?.data ?? [];
    return Array.isArray(rows) ? rows.map(normalize) : [];
  },

  /** GET /api/notification/:id */
  getById: async (id) => {
    const res = await api.get(`/notification/${id}`);
    return normalize(res.data.data);
  },

  /** PATCH /api/notification/:id/mark-as-read */
  markAsRead: async (id) => {
    await api.patch(`/notification/${id}/mark-as-read`);
    return id;
  },

  /** PATCH /api/notification/mark-all-as-read */
  markAllAsRead: async () => {
    await api.patch('/notification/mark-all-as-read');
  },

  /** DELETE /api/notification/:id */
  delete: async (id) => {
    await api.delete(`/notification/${id}`);
    return id;
  },
};

export default notificationService;
