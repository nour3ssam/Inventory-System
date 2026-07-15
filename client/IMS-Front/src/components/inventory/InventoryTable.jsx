import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteProduct, setSorting } from '../../store/inventorySlice';
import { 
  Edit, 
  Trash2, 
  Cpu, 
  FlaskConical, 
  Wrench, 
  Truck, 
  Package, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

// Maps item categories to colorful avatars and Lucide icons
const getCategoryAvatar = (category) => {
  const normalized = category?.toLowerCase();
  if (normalized === 'electronics') {
    return {
      icon: Cpu,
      bg: 'linear-gradient(135deg, rgba(47, 128, 255, 0.15) 0%, rgba(0, 210, 255, 0.15) 100%)',
      border: 'rgba(47, 128, 255, 0.3)',
      color: 'var(--neon-blue-data)',
    };
  }
  if (normalized === 'chemicals') {
    return {
      icon: FlaskConical,
      bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(244, 63, 94, 0.15) 100%)',
      border: 'rgba(239, 68, 68, 0.3)',
      color: 'var(--color-danger)',
    };
  }
  if (normalized === 'hardware') {
    return {
      icon: Wrench,
      bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(251, 191, 36, 0.15) 100%)',
      border: 'rgba(245, 158, 11, 0.3)',
      color: 'var(--color-warning)',
    };
  }
  if (normalized === 'logistics') {
    return {
      icon: Truck,
      bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(52, 211, 153, 0.15) 100%)',
      border: 'rgba(16, 185, 129, 0.3)',
      color: 'var(--color-success)',
    };
  }
  return {
    icon: Package,
    bg: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.1) 100%)',
    border: 'rgba(255, 255, 255, 0.15)',
    color: 'var(--text-pure-white)',
  };
};

const getStockBadge = (quantity) => {
  if (quantity === 0) {
    return <span className="badge badge-out-of-stock">Out of Stock</span>;
  }
  if (quantity <= 20) {
    return <span className="badge badge-low-stock">Low Stock</span>;
  }
  return <span className="badge badge-in-stock">In Stock</span>;
};

const InventoryTable = ({ onEditClick }) => {
  const dispatch = useDispatch();
  const { items, filters, sortBy, sortOrder } = useSelector((state) => state.inventory);

  // Table Row Selections
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter Items dynamically in client state
  let filteredItems = items.filter((item) => {
    // Search Filter
    const query = filters.search.toLowerCase();
    const matchesSearch = 
      item.name.toLowerCase().includes(query) || 
      item.sku.toLowerCase().includes(query);

    // Category Filter
    const matchesCategory = filters.category === 'All' || item.category === filters.category;

    // Supplier Filter
    const matchesSupplier = filters.supplier === 'All' || item.supplier === filters.supplier;

    // Warehouse Filter
    const matchesWarehouse = filters.warehouse === 'All' || item.warehouse === filters.warehouse;

    // Status Filter
    let matchesStatus = true;
    if (filters.status === 'In Stock') matchesStatus = item.quantity > 20;
    else if (filters.status === 'Low Stock') matchesStatus = item.quantity > 0 && item.quantity <= 20;
    else if (filters.status === 'Out of Stock') matchesStatus = item.quantity === 0;

    return matchesSearch && matchesCategory && matchesSupplier && matchesWarehouse && matchesStatus;
  });

  // Sort Items dynamically
  filteredItems = [...filteredItems].sort((a, b) => {
    let fieldA = a[sortBy];
    let fieldB = b[sortBy];

    if (sortBy === 'totalValue') {
      fieldA = a.quantity * a.unitPrice;
      fieldB = b.quantity * b.unitPrice;
    }

    if (typeof fieldA === 'string') {
      fieldA = fieldA.toLowerCase();
      fieldB = fieldB.toLowerCase();
    }

    if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1;
    if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination bounds calculation
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const handleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const pageIds = paginatedItems.map((item) => item.id);
      setSelectedIds([...new Set([...selectedIds, ...pageIds])]);
    } else {
      const pageIds = paginatedItems.map((item) => item.id);
      setSelectedIds(selectedIds.filter((id) => !pageIds.includes(id)));
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Confirm deletion of this inventory item?')) {
      dispatch(deleteProduct(id));
      setSelectedIds(selectedIds.filter((item) => item !== id));
    }
  };

  const handleSort = (field) => {
    dispatch(setSorting(field));
  };

  const renderSortIndicator = (field) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? <ChevronUp size={14} style={{ marginLeft: '4px' }} /> : <ChevronDown size={14} style={{ marginLeft: '4px' }} />;
  };

  const isAllPageRowsSelected = () => {
    if (paginatedItems.length === 0) return false;
    return paginatedItems.every((item) => selectedIds.includes(item.id));
  };

  return (
    <div className="glass-panel" style={{ padding: '0px', overflow: 'hidden' }}>
      <div className="table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th style={{ width: '40px', padding: '18px 24px' }}>
                <input 
                  type="checkbox"
                  checked={isAllPageRowsSelected()}
                  onChange={handleSelectAll}
                  style={{ accentColor: 'var(--neon-orange)', cursor: 'pointer' }}
                />
              </th>
              <th>Product Details</th>
              <th className="sortable" onClick={() => handleSort('sku')}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  SKU {renderSortIndicator('sku')}
                </div>
              </th>
              <th>Category</th>
              <th>Supplier</th>
              <th>Warehouse</th>
              <th className="sortable" onClick={() => handleSort('quantity')}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  Quantity {renderSortIndicator('quantity')}
                </div>
              </th>
              <th>Status</th>
              <th className="sortable" onClick={() => handleSort('unitPrice')}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  Unit Price {renderSortIndicator('unitPrice')}
                </div>
              </th>
              <th className="sortable" onClick={() => handleSort('totalValue')}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  Total Value {renderSortIndicator('totalValue')}
                </div>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.length > 0 ? (
              paginatedItems.map((item) => {
                const avatar = getCategoryAvatar(item.category);
                const AvatarIcon = avatar.icon;
                const isSelected = selectedIds.includes(item.id);

                return (
                  <tr key={item.id} className={isSelected ? 'selected' : ''}>
                    <td>
                      <input 
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(item.id)}
                        style={{ accentColor: 'var(--neon-orange)', cursor: 'pointer' }}
                      />
                    </td>
                    <td>
                      <div className="table-product-cell">
                        <div 
                          className="table-product-avatar" 
                          style={{ background: avatar.bg, borderColor: avatar.border, color: avatar.color }}
                        >
                          <AvatarIcon size={20} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: '600' }}>{item.name}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Updated: {new Date(item.lastUpdated).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <code style={{ color: 'var(--neon-blue-data)', fontWeight: '600' }}>{item.sku}</code>
                    </td>
                    <td>{item.category}</td>
                    <td>{item.supplier}</td>
                    <td>{item.warehouse}</td>
                    <td style={{ fontWeight: '600' }}>{item.quantity}</td>
                    <td>{getStockBadge(item.quantity)}</td>
                    <td>${item.unitPrice.toFixed(2)}</td>
                    <td style={{ fontWeight: '700', color: 'var(--text-pure-white)' }}>
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </td>
                    <td>
                      <div className="table-actions-cell">
                        <button 
                          className="btn-action" 
                          onClick={() => onEditClick(item)}
                          title="Edit Item"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="btn-action delete" 
                          onClick={() => handleDelete(item.id)}
                          title="Delete Item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="11" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No matching inventory records found. Add a product or reset search queries.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="table-pagination">
        <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Showing {filteredItems.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, filteredItems.length)} of {filteredItems.length} records
        </span>

        <div className="pagination-controls">
          <button 
            className="btn-pagination" 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            <ChevronLeft size={16} />
          </button>
          
          <span style={{ color: 'var(--text-pure-white)', fontWeight: '600', fontSize: '0.9rem' }}>
            Page {currentPage} of {totalPages}
          </span>

          <button 
            className="btn-pagination" 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryTable;
