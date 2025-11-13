import React from 'react';
import './ConfirmDialog.css';

/**
 * Reusable confirmation dialog component
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the dialog is visible
 * @param {Function} props.onClose - Callback when dialog is closed
 * @param {Function} props.onConfirm - Callback when user confirms
 * @param {string} props.title - Dialog title
 * @param {string} props.message - Dialog message
 * @param {string} [props.confirmText='Confirm'] - Confirm button text
 * @param {string} [props.cancelText='Cancel'] - Cancel button text
 * @param {string} [props.variant='danger'] - Visual variant: 'danger', 'warning', 'info'
 */
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="confirm-dialog-overlay" onClick={handleBackdropClick}>
      <div className="confirm-dialog">
        <div className="confirm-dialog-header">
          <h3 className="confirm-dialog-title">{title}</h3>
        </div>
        
        <div className="confirm-dialog-body">
          <p className="confirm-dialog-message">{message}</p>
        </div>
        
        <div className="confirm-dialog-footer">
          <button
            type="button"
            className="confirm-dialog-btn confirm-dialog-btn-cancel"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`confirm-dialog-btn confirm-dialog-btn-confirm confirm-dialog-btn-${variant}`}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
