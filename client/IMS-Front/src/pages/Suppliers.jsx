import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchQuery, fetchSuppliers } from '../store/supplierSlice';
import SupplierHeader from '../components/suppliers/SupplierHeader';
import SupplierStats from '../components/suppliers/SupplierStats';
import SupplierCardsGrid from '../components/suppliers/SupplierCardsGrid';
import SupplierModal from '../components/suppliers/SupplierModal';
import SupplierDetailModal from '../components/suppliers/SupplierDetailModal';
import '../styles/pages/Suppliers.css';

const Suppliers = () => {
  const dispatch = useDispatch();
  const searchQuery = useSelector((state) => state.suppliers.searchQuery);
  const products    = useSelector((state) => state.inventory.items);
  const suppliers   = useSelector((state) => state.suppliers.items);

  // Fetch from API on mount
  useEffect(() => {
    dispatch(fetchSuppliers());
  }, [dispatch]);

  // Form Modal (Add & Edit) states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSupplierForEdit, setSelectedSupplierForEdit] = useState(null);

  // Detail Modal states
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedSupplierForDetail, setSelectedSupplierForDetail] = useState(null);

  // Actions for Add/Edit
  const handleOpenAddModal = () => {
    setSelectedSupplierForEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (sup) => {
    setSelectedSupplierForEdit(sup);
    setIsFormOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormOpen(false);
    setSelectedSupplierForEdit(null);
  };

  // Actions for Detail card clicks
  const handleOpenDetailModal = (sup) => {
    setSelectedSupplierForDetail(sup);
    setIsDetailOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailOpen(false);
    setSelectedSupplierForDetail(null);
  };

  const handleSearchChange = (query) => {
    dispatch(setSearchQuery(query));
  };

  // Calculate live statistics for selected detail supplier
  const detailMetrics = React.useMemo(() => {
    if (!selectedSupplierForDetail) return { skus: 0, units: 0, value: 0 };
    
    const metrics = { skus: 0, units: 0, value: 0 };
    products.forEach(p => {
      if (p.supplier?.toLowerCase() === selectedSupplierForDetail.name?.toLowerCase()) {
        metrics.skus += 1;
        metrics.units += p.quantity;
        metrics.value += (p.quantity * p.unitPrice);
      }
    });
    return metrics;
  }, [selectedSupplierForDetail, products]);

  return (
    <div className="suppliers-layout">
      {/* Page Title & Subtitle */}
      <div className="page-header">
        <h1 className="page-title">Supplier Network</h1>
        <p className="page-subtitle">Manage third-party supply channels, ratings, and active valuations</p>
      </div>

      {/* Metrics Summary Panels */}
      <SupplierStats />

      {/* Control Header Actions (Search & Add) */}
      <SupplierHeader
        searchValue={searchQuery}
        onSearchChange={handleSearchChange}
        onAddClick={handleOpenAddModal}
      />

      {/* Suppliers social card Grid directory */}
      <SupplierCardsGrid
        onCardClick={handleOpenDetailModal}
        onEditClick={handleOpenEditModal}
      />

      {/* Supplier Modal Form (Add & Edit) */}
      <SupplierModal
        isOpen={isFormOpen}
        onClose={handleCloseFormModal}
        supplierToEdit={selectedSupplierForEdit}
      />

      {/* Supplier Details Profile Popover Drawer Modal */}
      <SupplierDetailModal
        isOpen={isDetailOpen}
        onClose={handleCloseDetailModal}
        supplier={selectedSupplierForDetail}
        metrics={detailMetrics}
      />
    </div>
  );
};

export default Suppliers;