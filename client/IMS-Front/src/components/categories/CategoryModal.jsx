import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addCategory, updateCategory } from '../../store/categorySlice';
import GlassModal from '../ui/GlassModal';

const CategoryModal = ({ isOpen, onClose, categoryToEdit }) => {
  const dispatch = useDispatch();

  // Local Form state
  const [name, setName] = useState('');
  // const [code, setCode] = useState('');
  // const [status, setStatus] = useState('Active');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});

  // Sync state with edit target prop
  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name || '');
      // setCode(categoryToEdit.code || '');
      // setStatus(categoryToEdit.status || 'Active');
      setDescription(categoryToEdit.description || '');
    } else {
      setName('');
      // setCode('');
      // setStatus('Active');
      setDescription('');
    }
    setErrors({});
  }, [categoryToEdit, isOpen]);

  const validateForm = () => {
    const tempErrors = {};
    if (!name.trim()) tempErrors.name = 'Category name is required';
    /*
    if (!code.trim()) tempErrors.code = 'Category code is required';
    else if (!/^[A-Z0-9_-]{3,10}$/i.test(code.trim())) {
      tempErrors.code = 'Code must be 3-10 alphanumeric characters';
    }
    */
    if (!description.trim()) tempErrors.description = 'Description is required';
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const categoryData = {
      name: name.trim(),
      // code: code.trim().toUpperCase(),
      // status,
      description: description.trim(),
    };

    if (categoryToEdit) {
      dispatch(updateCategory({
        ...categoryToEdit,
        ...categoryData,
      }));
    } else {
      dispatch(addCategory(categoryData));
    }

    onClose();
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={categoryToEdit ? 'Edit Category' : 'Add New Category'}
    >
      <form onSubmit={handleSubmit} className="modal-form">
        <div className="modal-form-grid">
          {/* Category Name */}
          <div className="form-group">
            <label className="form-label">Category Name</label>
            <input
              type="text"
              placeholder="e.g. Avionics"
              className={`form-input ${errors.name ? 'error' : ''}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && <span className="form-error-msg">{errors.name}</span>}
          </div>

          {/* Category Code */}
          {/*
          <div className="form-group">
            <label className="form-label">Category Code</label>
            <input
              type="text"
              placeholder="e.g. CAT-AVN"
              className={`form-input ${errors.code ? 'error' : ''}`}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={!!categoryToEdit} // Disable editing the code for existing categories
            />
            {errors.code && <span className="form-error-msg">{errors.code}</span>}
          </div>
          */}

          {/* Status Selection */}
          {/*
          <div className="form-group">
            <label className="form-label">Operational Status</label>
            <select
              className="form-input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          */}
        </div>

        {/* Category Description */}
        <div className="form-group" style={{ marginTop: '20px' }}>
          <label className="form-label">Description</label>
          <textarea
            placeholder="Describe the items classified under this category..."
            className={`form-input textarea ${errors.description ? 'error' : ''}`}
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {errors.description && <span className="form-error-msg">{errors.description}</span>}
        </div>

        {/* Actions Button */}
        <div className="modal-actions" style={{ marginTop: '28px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {categoryToEdit ? 'Save Changes' : 'Create Category'}
          </button>
        </div>
      </form>
    </GlassModal>
  );
};

export default CategoryModal;
