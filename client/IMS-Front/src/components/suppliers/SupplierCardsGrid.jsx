import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { deleteSupplier } from '../../store/supplierSlice';
import { ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import SupplierCard from './SupplierCard';

const SupplierCardsGrid = ({ onCardClick, onEditClick }) => {
  const dispatch = useDispatch();
  const suppliers = useSelector((state) => state.suppliers.items);
  const searchQuery = useSelector((state) => state.suppliers.searchQuery);
  const products = useSelector((state) => state.inventory.items);

  // Sorting state
  const [sortBy, setSortBy] = useState('name'); // name, rating, value
  const [sortOrder, setSortOrder] = useState('asc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Compute live statistics for each supplier
  const supplierMetrics = React.useMemo(() => {
    const metrics = {};
    
    suppliers.forEach(s => {
      metrics[s.id] = { skus: 0, units: 0, value: 0 };
    });

    products.forEach(p => {
      const matchedSup = suppliers.find(
        s => s.name.toLowerCase() === p.supplier?.toLowerCase()
      );
      if (matchedSup) {
        metrics[matchedSup.id].skus += 1;
        metrics[matchedSup.id].units += p.quantity;
        metrics[matchedSup.id].value += (p.quantity * p.unitPrice);
      }
    });

    return metrics;
  }, [suppliers, products]);

  // Filter list based on search queries
  const filteredSuppliers = React.useMemo(() => {
    return suppliers.filter((sup) => {
      const query = searchQuery.toLowerCase();
      return (
        sup.name.toLowerCase().includes(query) ||
        // sup.code.toLowerCase().includes(query) ||
        // sup.contactPerson.toLowerCase().includes(query) ||
        sup.email.toLowerCase().includes(query)
      );
    });
  }, [suppliers, searchQuery]);

  // Sort list
  const sortedSuppliers = React.useMemo(() => {
    const sorted = [...filteredSuppliers];
    
    sorted.sort((a, b) => {
      let fieldA, fieldB;

      if (sortBy === 'name') {
        fieldA = a.name.toLowerCase();
        fieldB = b.name.toLowerCase();
      }
      /*
      else if (sortBy === 'rating') {
        fieldA = a.rating || 0;
        fieldB = b.rating || 0;
      }
      */
      else if (sortBy === 'value') {
        fieldA = supplierMetrics[a.id]?.value || 0;
        fieldB = supplierMetrics[b.id]?.value || 0;
      } else {
        return 0;
      }

      if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredSuppliers, sortBy, sortOrder, supplierMetrics]);

  // Pagination calculation
  const totalPages = Math.ceil(sortedSuppliers.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSuppliers = sortedSuppliers.slice(startIndex, startIndex + itemsPerPage);

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc'); // Default ratings and values sorting to desc (highest first)
    }
    setCurrentPage(1);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete the supplier "${name}"?`)) {
      dispatch(deleteSupplier(id));
      setCurrentPage(1);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      
      {/* Sorting Tool Bar */}
      <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', flexWrap: 'wrap', gap: '12px' }}>
        <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Found {sortedSuppliers.length} vendor partnerships
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sort by:</span>
          
          <button 
            className={`btn btn-secondary ${sortBy === 'name' ? 'active' : ''}`}
            style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => handleSortChange('name')}
          >
            Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          
          {/*
          <button 
            className={`btn btn-secondary ${sortBy === 'rating' ? 'active' : ''}`}
            style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => handleSortChange('rating')}
          >
            Rating {sortBy === 'rating' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          */}

          <button 
            className={`btn btn-secondary ${sortBy === 'value' ? 'active' : ''}`}
            style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => handleSortChange('value')}
          >
            Valuation {sortBy === 'value' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      {/* Grid List */}
      {paginatedSuppliers.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px', width: '100%' }}>
          {paginatedSuppliers.map((sup) => (
            <SupplierCard 
              key={sup.id}
              supplier={sup}
              metrics={supplierMetrics[sup.id] || { skus: 0, units: 0, value: 0 }}
              onCardClick={onCardClick}
              onEditClick={onEditClick}
              onDeleteClick={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No matching supplier partnerships found. Try adjusting your query search terms.
        </div>
      )}

      {/* Pagination Footer */}
      <div className="table-pagination" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Showing {sortedSuppliers.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, sortedSuppliers.length)} of {sortedSuppliers.length} partnerships
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

export default SupplierCardsGrid;
