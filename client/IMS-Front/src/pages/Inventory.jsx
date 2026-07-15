import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters, fetchProducts } from '../store/inventorySlice';
import InventoryHeader from '../components/inventory/InventoryHeader';
import InventoryStats from '../components/inventory/InventoryStats';
import InventoryFilters from '../components/inventory/InventoryFilters';
import InventoryTable from '../components/inventory/InventoryTable';
import InventoryQuickPanel from '../components/inventory/InventoryQuickPanel';
import ItemModal from '../components/inventory/ItemModal';
import '../styles/pages/Inventory.css';

const Inventory = () => {
  const dispatch = useDispatch();
  const { filters, loading } = useSelector((state) => state.inventory);

  // Fetch from API on mount
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Modal Triggers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleOpenAddModal = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  // Sync search filter
  const handleSearchChange = (query) => {
    dispatch(setFilters({ search: query }));
  };

  return (
    <div className="inventory-layout">
      {/* Main Content Stream */}
      <div className="inventory-main">
        {/* Top Header Controls */}
        <InventoryHeader 
          onAddClick={handleOpenAddModal}
          searchValue={filters.search}
          onSearchChange={handleSearchChange}
        />

        {/* Stats Grid */}
        <InventoryStats />

        {/* Filters Panel */}
        <InventoryFilters />

        {/* Main Products Glass Table */}
        <InventoryTable 
          onEditClick={handleOpenEditModal}
        />
      </div>

      {/* Floating Right Actions Widget Panel */}
      <InventoryQuickPanel />

      {/* Form Input Drawer Modal */}
      <ItemModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        itemToEdit={selectedItem}
      />
    </div>
  );
};

export default Inventory;