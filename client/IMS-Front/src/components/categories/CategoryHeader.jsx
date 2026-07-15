import React from 'react';
import { Search, Plus } from 'lucide-react';

const CategoryHeader = ({ searchValue, onSearchChange, onAddClick }) => {
  return (
    <div className="categories-header-actions">
      {/* 1. Glass search classification bar */}
      <div className="search-input-wrapper">
        <Search size={18} className="search-input-icon" />
        <input
          type="text"
          placeholder="Search category name or code..."
          className="search-input-field"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* 2. Create category button */}
      <button 
        className="btn btn-primary"
        onClick={onAddClick}
      >
        <Plus size={18} />
        <span>Add Category</span>
      </button>
    </div>
  );
};

export default CategoryHeader;
