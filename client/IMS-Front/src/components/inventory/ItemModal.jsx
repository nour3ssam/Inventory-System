import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addProduct, updateProduct } from '../../store/inventorySlice';
import { fetchCategories } from '../../store/categorySlice';
import GlassModal from '../ui/GlassModal';

const ItemModal = ({ isOpen, onClose, itemToEdit }) => {
  const dispatch = useDispatch();
  const categories = useSelector((state) => state.categories.items);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Local Form State variables
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    description: '',
    categoryId: '',
    quantity: 0,
    unitPrice: 0.0,
    costPrice: 0.0,
    reorderLevel: 0,
    minStockLevel: 0,
    unit: 'pcs',
  });

  const [formErrors, setFormErrors] = useState({});

  // Sync edit item values on modal open
  useEffect(() => {
    if (itemToEdit) {
      setFormData({
        id: itemToEdit.id,
        name: itemToEdit.name,
        sku: itemToEdit.sku,
        barcode: itemToEdit.barcode || '',
        description: itemToEdit.description || '',
        categoryId: itemToEdit.categoryId || '',
        quantity: itemToEdit.quantity,
        unitPrice: itemToEdit.unitPrice,
        costPrice: itemToEdit.costPrice || 0,
        reorderLevel: itemToEdit.reorderLevel || 0,
        minStockLevel: itemToEdit.minStockLevel || 0,
        unit: itemToEdit.unit || 'pcs',
      });
    } else {
      setFormData({
        name: '',
        sku: '',
        barcode: '',
        description: '',
        categoryId: '',
        quantity: 0,
        unitPrice: 0.0,
        costPrice: 0.0,
        reorderLevel: 0,
        minStockLevel: 0,
        unit: 'pcs',
      });
    }
    setFormErrors({});
  }, [itemToEdit, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
    // Reset field errors
    if (formErrors[field]) {
      setFormErrors({
        ...formErrors,
        [field]: null,
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Product name is required';
    if (!formData.sku.trim()) errors.sku = 'SKU identifier code is required';
    if (!formData.categoryId) errors.categoryId = 'Category is required';
    if (formData.quantity < 0) errors.quantity = 'Quantity cannot be negative';
    if (formData.unitPrice < 0) errors.unitPrice = 'Selling price cannot be negative';
    if (formData.costPrice < 0) errors.costPrice = 'Cost price cannot be negative';
    if (formData.reorderLevel < 0) errors.reorderLevel = 'Cannot be negative';
    if (formData.minStockLevel < 0) errors.minStockLevel = 'Cannot be negative';
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (itemToEdit) {
      dispatch(updateProduct(formData));
    } else {
      dispatch(addProduct(formData));
    }
    onClose();
  };

  const isEditMode = !!itemToEdit;

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Modify Product Record' : 'Register New Inventory Item'}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Name and SKU */}
        <div className="modal-form-grid">
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Laser Diode Array"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
            {formErrors.name && (
              <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem' }}>{formErrors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">SKU Identifier *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. SKU-1234"
              value={formData.sku}
              onChange={(e) => handleInputChange('sku', e.target.value)}
              disabled={isEditMode}
              style={{ opacity: isEditMode ? 0.6 : 1 }}
            />
            {formErrors.sku && (
              <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem' }}>{formErrors.sku}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Barcode (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 123456789012"
              value={formData.barcode}
              onChange={(e) => handleInputChange('barcode', e.target.value)}
            />
          </div>
        </div>

        {/* Description */}
        <div className="modal-form-grid">
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              placeholder="Product details..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows="2"
            />
          </div>
        </div>

        {/* Category */}
        <div className="modal-form-grid">
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Category Class</label>
            <select
              className="filter-select"
              value={formData.categoryId}
              onChange={(e) => handleInputChange('categoryId', e.target.value)}
            >
              <option value="">Select a Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {formErrors.categoryId && (
              <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem' }}>{formErrors.categoryId}</span>
            )}
          </div>
        </div>

        {/* Qty and Unit Price */}
        <div className="modal-form-grid">
          <div className="form-group">
            <label className="form-label">Starting Units (Qty) *</label>
            <input
              type="number"
              min="0"
              className="form-input"
              placeholder="e.g. 50"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
            />
            {formErrors.quantity && (
              <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem' }}>{formErrors.quantity}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Unit Net Price ($) *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="form-input"
              placeholder="e.g. 19.99"
              value={formData.unitPrice}
              onChange={(e) => handleInputChange('unitPrice', parseFloat(e.target.value) || 0.0)}
            />
            {formErrors.unitPrice && (
              <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem' }}>{formErrors.unitPrice}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Cost Price ($) *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="form-input"
              placeholder="e.g. 10.00"
              value={formData.costPrice}
              onChange={(e) => handleInputChange('costPrice', parseFloat(e.target.value) || 0.0)}
            />
            {formErrors.costPrice && (
              <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem' }}>{formErrors.costPrice}</span>
            )}
          </div>
        </div>

        {/* Reorder and Min Stock */}
        <div className="modal-form-grid">
          <div className="form-group">
            <label className="form-label">Reorder Level</label>
            <input
              type="number"
              min="0"
              className="form-input"
              placeholder="e.g. 20"
              value={formData.reorderLevel}
              onChange={(e) => handleInputChange('reorderLevel', parseInt(e.target.value) || 0)}
            />
            {formErrors.reorderLevel && (
              <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem' }}>{formErrors.reorderLevel}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Min Stock Level</label>
            <input
              type="number"
              min="0"
              className="form-input"
              placeholder="e.g. 10"
              value={formData.minStockLevel}
              onChange={(e) => handleInputChange('minStockLevel', parseInt(e.target.value) || 0)}
            />
            {formErrors.minStockLevel && (
              <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem' }}>{formErrors.minStockLevel}</span>
            )}
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Unit of Measurement</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. pcs, kg, box"
              value={formData.unit}
              onChange={(e) => handleInputChange('unit', e.target.value)}
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="filters-actions" style={{ marginBottom: '0', marginTop: '12px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
          >
            {isEditMode ? 'Apply Updates' : 'Confirm Registration'}
          </button>
        </div>

      </form>
    </GlassModal>
  );
};

export default ItemModal;
