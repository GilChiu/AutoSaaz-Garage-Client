import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';

const LocationForm = () => {
    const [location, setLocation] = useState({
        address: '',
        city: '',
        state: '',
        zip: ''
    });
    const { postLocation } = useApi();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocation({ ...location, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await postLocation(location);
            // Handle successful submission (e.g., show a success message or redirect)
        } catch (error) {
            // Handle error (e.g., show an error message)
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="address">Address:</label>
                <input
                    type="text"
                    id="address"
                    name="address"
                    value={location.address}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label htmlFor="city">City:</label>
                <input
                    type="text"
                    id="city"
                    name="city"
                    value={location.city}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label htmlFor="state">State:</label>
                <input
                    type="text"
                    id="state"
                    name="state"
                    value={location.state}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label htmlFor="zip">Zip Code:</label>
                <input
                    type="text"
                    id="zip"
                    name="zip"
                    value={location.zip}
                    onChange={handleChange}
                    required
                />
            </div>
            <button type="submit">Submit</button>
        </form>
    );
};

export default LocationForm;