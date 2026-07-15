import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchQuery, fetchCategories } from '../store/categorySlice';
import CategoryHeader from '../components/categories/CategoryHeader';
import CategoryStats from '../components/categories/CategoryStats';
import CategoryTable from '../components/categories/CategoryTable';
import CategoryModal from '../components/categories/CategoryModal';
import '../styles/pages/Categories.css';

const Categories = () => {
  const dispatch    = useDispatch();
  const searchQuery = useSelector((state) => state.categories.searchQuery);

  // Fetch from API on mount
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Modal Open/Close triggers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleOpenAddModal = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setSelectedCategory(cat);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const handleSearchChange = (query) => {
    dispatch(setSearchQuery(query));
  };

  return (
    <div className="categories-layout">
      {/* Page Title & Subtitle Info */}
      <div className="page-header">
        <h1 className="page-title">Category Directory</h1>
        <p className="page-subtitle">Organize and structure stock classification models</p>
      </div>

      {/* Metrics Summary Panels */}
      <CategoryStats />

      {/* Control Header Actions (Search & Add) */}
      <CategoryHeader
        searchValue={searchQuery}
        onSearchChange={handleSearchChange}
        onAddClick={handleOpenAddModal}
      />

      {/* Categories glass directory Table */}
      <CategoryTable
        onEditClick={handleOpenEditModal}
      />

      {/* Category Modal Form (Add & Edit) */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        categoryToEdit={selectedCategory}
      />
    </div>
  );
};

export default Categories;
