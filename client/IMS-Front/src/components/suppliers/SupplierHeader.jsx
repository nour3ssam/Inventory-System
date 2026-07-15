import React from 'react';
import { Search, Plus } from 'lucide-react';

const SupplierHeader = ({ searchValue, onSearchChange, onAddClick }) => {
  return (
    <div className="suppliers-header-actions">
      {/* Search Input field */}
      <div className="search-input-wrapper">
        <Search size={18} className="search-input-icon" />
        <input
          type="text"
          placeholder="Search supplier name, code, or contact..."
          className="search-input-field"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Add Supplier trigger CTA button */}
      <button 
        className="btn btn-primary"
        onClick={onAddClick}
      >
        <Plus size={18} />
        <span>Add Supplier</span>
      </button>
    </div>
  );
};

export default SupplierHeader;
