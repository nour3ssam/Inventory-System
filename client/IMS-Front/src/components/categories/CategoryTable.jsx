import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { deleteCategory } from '../../store/categorySlice';
import { Edit, Trash2, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';

const CategoryTable = ({ onEditClick }) => {
  const dispatch = useDispatch();
  const categories = useSelector((state) => state.categories.items);
  const searchQuery = useSelector((state) => state.categories.searchQuery);
  const products = useSelector((state) => state.inventory.items);

  // Table sorting states
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Compute metrics per category dynamically from products list
  const categoryMetrics = React.useMemo(() => {
    const metrics = {};

    categories.forEach(cat => {
      metrics[cat.id] = { skus: 0, units: 0, value: 0 };
    });

    products.forEach(p => {
      const matchedCat = categories.find(
        c => c.name.toLowerCase() === p.category?.toLowerCase()
      );
      if (matchedCat) {
        metrics[matchedCat.id].skus += 1;
        metrics[matchedCat.id].units += p.quantity;
        metrics[matchedCat.id].value += (p.quantity * p.unitPrice);
      }
    });

    return metrics;
  }, [categories, products]);

  // Filter categories by search query
  const filteredCategories = React.useMemo(() => {
    return categories.filter((cat) => {
      const query = searchQuery.toLowerCase();
      return (
        cat.name?.toLowerCase().includes(query) ||
        cat.code?.toLowerCase().includes(query)
      );
    });
  }, [categories, searchQuery]);

  const sortedCategories = React.useMemo(() => {
    const sorted = [...filteredCategories];

    sorted.sort((a, b) => {
      let fieldA, fieldB;

      if (sortBy === 'name') {
        fieldA = a.name.toLowerCase();
        fieldB = b.name.toLowerCase();
      }
      /*
      else if (sortBy === 'code') {
        fieldA = a.code.toLowerCase();
        fieldB = b.code.toLowerCase();
      } else if (sortBy === 'status') {
        fieldA = a.status.toLowerCase();
        fieldB = b.status.toLowerCase();
      }
      */
      else if (sortBy === 'skus') {
        fieldA = categoryMetrics[a.id]?.skus || 0;
        fieldB = categoryMetrics[b.id]?.skus || 0;
      } else if (sortBy === 'units') {
        fieldA = categoryMetrics[a.id]?.units || 0;
        fieldB = categoryMetrics[b.id]?.units || 0;
      } else if (sortBy === 'value') {
        fieldA = categoryMetrics[a.id]?.value || 0;
        fieldB = categoryMetrics[b.id]?.value || 0;
      } else {
        return 0;
      }

      if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredCategories, sortBy, sortOrder, categoryMetrics]);

  // Pagination calculation
  const totalPages = Math.ceil(sortedCategories.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCategories = sortedCategories.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const renderSortIndicator = (field) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? (
      <ChevronUp size={14} style={{ marginLeft: '4px', verticalAlign: 'middle' }} />
    ) : (
      <ChevronDown size={14} style={{ marginLeft: '4px', verticalAlign: 'middle' }} />
    );
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete the category "${name}"?`)) {
      dispatch(deleteCategory(id));
      setCurrentPage(1);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '0px', overflow: 'hidden' }}>
      <div className="table-container">
        <table className="categories-table">
          <thead>
            <tr>
              {/*
              <th className="sortable" onClick={() => handleSort('code')}>
                Code {renderSortIndicator('code')}
              </th>
              */}
              <th className="sortable" onClick={() => handleSort('name')}>
                Category {renderSortIndicator('name')}
              </th>
              {/*
              <th className="sortable" onClick={() => handleSort('status')}>
                Status {renderSortIndicator('status')}
              </th>
              */}
              <th className="sortable" style={{ textAlign: 'right' }} onClick={() => handleSort('skus')}>
                Unique SKUs {renderSortIndicator('skus')}
              </th>
              <th className="sortable" style={{ textAlign: 'right' }} onClick={() => handleSort('units')}>
                Total Units {renderSortIndicator('units')}
              </th>
              <th className="sortable" style={{ textAlign: 'right' }} onClick={() => handleSort('value')}>
                Valuation {renderSortIndicator('value')}
              </th>
              <th style={{ paddingLeft: '40px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCategories.length > 0 ? (
              paginatedCategories.map((cat) => {
                const metrics = categoryMetrics[cat.id] || { skus: 0, units: 0, value: 0 };
                // const isInactive = cat.status?.toLowerCase() === 'inactive';

                return (
                  <tr key={cat.id}>
                    {/*
                    <td>
                      <span className="code-badge">{cat.code}</span>
                    </td>
                    */}
                    <td>
                      <div className="category-name-cell">
                        <span className="category-title-text">{cat.name}</span>
                        <span className="category-description-text" title={cat.description}>
                          {cat.description}
                        </span>
                      </div>
                    </td>
                    {/*
                    <td>
                      <span className={`badge ${isInactive ? 'badge-inactive' : 'badge-active'}`}>
                        {cat.status}
                      </span>
                    </td>
                    */}
                    <td style={{ textAlign: 'right', fontWeight: '600' }}>
                      {metrics.skus}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '600' }}>
                      {metrics.units}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--text-pure-white)' }}>
                      ${metrics.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td>
                      <div className="table-actions-cell" style={{ paddingLeft: '16px' }}>
                        <button
                          className="btn-action"
                          onClick={() => onEditClick(cat)}
                          title="Edit Category"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="btn-action delete"
                          onClick={() => handleDelete(cat.id, cat.name)}
                          title="Delete Category"
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
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No matching category records found. Search again or add a category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="table-pagination">
        <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Showing {sortedCategories.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, sortedCategories.length)} of {sortedCategories.length} categories
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

export default CategoryTable;
