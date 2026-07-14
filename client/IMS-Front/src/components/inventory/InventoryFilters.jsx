import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters, resetFilters } from '../../store/inventorySlice';
import { RefreshCw, Download, Filter } from 'lucide-react';

const InventoryFilters = () => {
  const dispatch = useDispatch();
  const { filters, items } = useSelector((state) => state.inventory);

  // Extract unique values from items list dynamically to construct options
  const categories = ['All', ...new Set(items.map((item) => item.category))];
  const suppliers = ['All', ...new Set(items.map((item) => item.supplier))];
  const warehouses = ['All', ...new Set(items.map((item) => item.warehouse))];
  const statuses = ['All', 'In Stock', 'Low Stock', 'Out of Stock'];

  // Dispatch filter updates
  const handleFilterChange = (field, value) => {
    dispatch(setFilters({ [field]: value }));
  };

  const handleReset = () => {
    dispatch(resetFilters());
  };

  const handleExport = () => {
    alert('Generating spreadsheet report... Dynamic CSV file has been generated and queued for download.');
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Filter size={18} color="var(--neon-orange)" />
        <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-pure-white)' }}>
          Inventory Search Filters
        </h2>
      </div>

      <div className="filters-grid">
        {/* Local Table Search */}
        <div className="form-group">
          <label className="form-label">Search Name / SKU</label>
          <input 
            type="text" 
            placeholder="Type query..." 
            className="form-input"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            style={{ padding: '10px 14px' }}
          />
        </div>

        {/* Category Select */}
        <div className="form-group">
          <label className="form-label">Category Filter</label>
          <select 
            className="filter-select"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            {categories.map((cat, idx) => (
              <option key={`cat-${idx}`} value={cat || ''}>{cat || 'Unknown'}</option>
            ))}
          </select>
        </div>

        {/* Supplier Select */}
        <div className="form-group">
          <label className="form-label">Supplier Partner</label>
          <select 
            className="filter-select"
            value={filters.supplier}
            onChange={(e) => handleFilterChange('supplier', e.target.value)}
          >
            {suppliers.map((sup, idx) => (
              <option key={`sup-${idx}`} value={sup || ''}>{sup || 'Unknown'}</option>
            ))}
          </select>
        </div>

        {/* Warehouse Location Select */}
        <div className="form-group">
          <label className="form-label">Warehouse Depot</label>
          <select 
            className="filter-select"
            value={filters.warehouse}
            onChange={(e) => handleFilterChange('warehouse', e.target.value)}
          >
            {warehouses.map((wh, idx) => (
              <option key={`wh-${idx}`} value={wh || ''}>{wh || 'Unknown'}</option>
            ))}
          </select>
        </div>

        {/* Stock Status Select */}
        <div className="form-group">
          <label className="form-label">Stock Status</label>
          <select 
            className="filter-select"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            {statuses.map((status, idx) => (
              <option key={`status-${idx}`} value={status || ''}>{status || 'Unknown'}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Action triggers */}
      <div className="filters-actions">
        <button 
          className="btn btn-secondary" 
          onClick={handleReset}
          style={{ padding: '10px 16px', gap: '6px', fontSize: '0.88rem' }}
        >
          <RefreshCw size={16} />
          <span>Reset Filters</span>
        </button>

        {/* <button 
          className="btn btn-primary" 
          onClick={handleExport}
          style={{ padding: '10px 16px', gap: '6px', fontSize: '0.88rem' }}
        >
          <Download size={16} />
          <span>Export Ledger</span>
        </button> */}
      </div>
    </div>
  );
};

export default InventoryFilters;
