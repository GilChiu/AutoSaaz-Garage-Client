import React, { useState } from 'react';

const BusinessDetailsForm = ({ onSubmit }) => {
    const [businessName, setBusinessName] = useState('');
    const [businessType, setBusinessType] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        if (!businessName) newErrors.businessName = 'Business name is required';
        if (!businessType) newErrors.businessType = 'Business type is required';
        if (!contactNumber) newErrors.contactNumber = 'Contact number is required';
        if (!email) newErrors.email = 'Email is required';
        if (!address) newErrors.address = 'Address is required';
        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
        } else {
            setErrors({});
            onSubmit({ businessName, businessType, contactNumber, email, address });
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Business Name</label>
                <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                />
                {errors.businessName && <span>{errors.businessName}</span>}
            </div>
            <div>
                <label>Business Type</label>
                <input
                    type="text"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                />
                {errors.businessType && <span>{errors.businessType}</span>}
            </div>
            <div>
                <label>Contact Number</label>
                <input
                    type="text"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                />
                {errors.contactNumber && <span>{errors.contactNumber}</span>}
            </div>
            <div>
                <label>Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <span>{errors.email}</span>}
            </div>
            <div>
                <label>Address</label>
                <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                />
                {errors.address && <span>{errors.address}</span>}
            </div>
            <button type="submit">Submit</button>
        </form>
    );
};

export default BusinessDetailsForm;