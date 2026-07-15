import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addSupplier, updateSupplier } from '../../store/supplierSlice';
import GlassModal from '../ui/GlassModal';

const SupplierModal = ({ isOpen, onClose, supplierToEdit }) => {
  const dispatch = useDispatch();

  // Local form states
  const [name, setName] = useState('');
  // const [code, setCode] = useState('');
  // const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  // const [rating, setRating] = useState(4.5);
  // const [status, setStatus] = useState('Active');
  // const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});

  // Sync state with edit target prop
  useEffect(() => {
    if (supplierToEdit) {
      setName(supplierToEdit.name || '');
      // setCode(supplierToEdit.code || '');
      // setContactPerson(supplierToEdit.contactPerson || '');
      setEmail(supplierToEdit.email || '');
      setPhone(supplierToEdit.phone || '');
      setAddress(supplierToEdit.address || '');
      // setRating(supplierToEdit.rating || 4.5);
      // setStatus(supplierToEdit.status || 'Active');
      // setDescription(supplierToEdit.description || '');
    } else {
      setName('');
      // setCode('');
      // setContactPerson('');
      setEmail('');
      setPhone('');
      setAddress('');
      // setRating(4.5);
      // setStatus('Active');
      // setDescription('');
    }
    setErrors({});
  }, [supplierToEdit, isOpen]);

  const validateForm = () => {
    const tempErrors = {};
    if (!name.trim()) tempErrors.name = 'Supplier name is required';
    /*
    if (!code.trim()) tempErrors.code = 'Supplier code is required';
    else if (!/^[A-Z0-9_-]{3,10}$/i.test(code.trim())) {
      tempErrors.code = 'Code must be 3-10 alphanumeric characters';
    }
    if (!contactPerson.trim()) tempErrors.contactPerson = 'Contact person is required';
    */
    if (!email.trim()) tempErrors.email = 'Contact email is required';
    else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      tempErrors.email = 'Please specify a valid email address';
    }
    if (!phone.trim()) tempErrors.phone = 'Phone number is required';
    if (!address.trim()) tempErrors.address = 'Address is required';
    /*
    if (rating < 1.0 || rating > 5.0) {
      tempErrors.rating = 'Rating must be between 1.0 and 5.0';
    }
    if (!description.trim()) tempErrors.description = 'Vendor summary is required';
    */

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const supplierData = {
      name: name.trim(),
      // code: code.trim().toUpperCase(),
      // contactPerson: contactPerson.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      // rating: parseFloat(rating),
      // status,
      // description: description.trim(),
    };

    if (supplierToEdit) {
      dispatch(updateSupplier({
        ...supplierToEdit,
        ...supplierData,
      }));
    } else {
      dispatch(addSupplier(supplierData));
    }

    onClose();
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={supplierToEdit ? 'Edit Supplier Details' : 'Register New Supplier'}
    >
      <form onSubmit={handleSubmit} className="modal-form">
        <div className="modal-form-grid">
          {/* Vendor Name */}
          <div className="form-group">
            <label className="form-label">Vendor / Company Name</label>
            <input
              type="text"
              placeholder="e.g. Apex Tech"
              className={`form-input ${errors.name ? 'error' : ''}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && <span className="form-error-msg">{errors.name}</span>}
          </div>

          {/* Supplier Code */}
          {/*
          <div className="form-group">
            <label className="form-label">Supplier Code</label>
            <input
              type="text"
              placeholder="e.g. SUP-APX"
              className={`form-input ${errors.code ? 'error' : ''}`}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={!!supplierToEdit}
            />
            {errors.code && <span className="form-error-msg">{errors.code}</span>}
          </div>
          */}

          {/* Contact Person */}
          {/*
          <div className="form-group">
            <label className="form-label">Contact Person</label>
            <input
              type="text"
              placeholder="e.g. Sarah Connor"
              className={`form-input ${errors.contactPerson ? 'error' : ''}`}
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
            />
            {errors.contactPerson && <span className="form-error-msg">{errors.contactPerson}</span>}
          </div>
          */}

          {/* Contact Email */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              placeholder="e.g. sconnor@apextech.io"
              className={`form-input ${errors.email ? 'error' : ''}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <span className="form-error-msg">{errors.email}</span>}
          </div>

          {/* Contact Phone */}
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="text"
              placeholder="e.g. +1 (555) 019-2831"
              className={`form-input ${errors.phone ? 'error' : ''}`}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {errors.phone && <span className="form-error-msg">{errors.phone}</span>}
          </div>

          {/* Supplier Address */}
          <div className="form-group">
            <label className="form-label">Address</label>
            <input
              type="text"
              placeholder="e.g. 123 Tech Avenue"
              className={`form-input ${errors.address ? 'error' : ''}`}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            {errors.address && <span className="form-error-msg">{errors.address}</span>}
          </div>

          {/* Rating */}
          {/*
          <div className="form-group">
            <label className="form-label">Performance Rating (1.0 - 5.0)</label>
            <input
              type="number"
              step="0.1"
              min="1.0"
              max="5.0"
              placeholder="4.5"
              className={`form-input ${errors.rating ? 'error' : ''}`}
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            />
            {errors.rating && <span className="form-error-msg">{errors.rating}</span>}
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

        {/* Vendor Summary Description */}
        {/*
        <div className="form-group" style={{ marginTop: '20px' }}>
          <label className="form-label">Vendor Summary / Notes</label>
          <textarea
            placeholder="Summarize components or services provided by this partnership..."
            className={`form-input textarea ${errors.description ? 'error' : ''}`}
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {errors.description && <span className="form-error-msg">{errors.description}</span>}
        </div>
        */}

        {/* Actions Button */}
        <div className="modal-actions" style={{ marginTop: '28px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {supplierToEdit ? 'Save Changes' : 'Register Supplier'}
          </button>
        </div>
      </form>
    </GlassModal>
  );
};

export default SupplierModal;
