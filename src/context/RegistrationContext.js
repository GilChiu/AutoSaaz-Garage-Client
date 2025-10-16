import React, { createContext, useContext, useState } from 'react';
import {
  getRegistrationData as getStoredRegistrationData,
  setRegistrationData as setStoredRegistrationData,
  clearRegistrationData as clearStoredRegistrationData,
} from '../services/storage.service';

const RegistrationContext = createContext();

export const RegistrationProvider = ({ children }) => {
    // Initialize from storage if available
    const storedData = getStoredRegistrationData();
    
    const [registrationData, setRegistrationData] = useState(storedData || {
        // Step 1: Personal Info (from API)
        userId: '',
        fullName: '',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phoneNumber: '',
        requiresVerification: false,
        
        // Step 2: Business Location
        address: '',
        street: '',
        state: '',
        location: '',
        coordinates: null,
        
        // Step 3: Business Details
        companyLegalName: '',
        emiratesIdUrl: '',
        tradeLicenseNumber: '',
        vatCertification: '',
        
        // Navigation
        currentStep: 1,
        isVerified: false
    });

    const updateRegistrationData = (data) => {
        const updatedData = {
            ...registrationData,
            ...data
        };
        setRegistrationData(updatedData);
        // Persist to storage
        setStoredRegistrationData(updatedData);
    };

    const goToNextStep = () => {
        const updatedData = {
            ...registrationData,
            currentStep: registrationData.currentStep + 1
        };
        setRegistrationData(updatedData);
        setStoredRegistrationData(updatedData);
    };

    const goToPreviousStep = () => {
        const updatedData = {
            ...registrationData,
            currentStep: registrationData.currentStep - 1
        };
        setRegistrationData(updatedData);
        setStoredRegistrationData(updatedData);
    };

    const resetRegistration = () => {
        const emptyData = {
            userId: '',
            fullName: '',
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            phoneNumber: '',
            requiresVerification: false,
            address: '',
            street: '',
            state: '',
            location: '',
            coordinates: null,
            companyLegalName: '',
            emiratesIdUrl: '',
            tradeLicenseNumber: '',
            vatCertification: '',
            currentStep: 1,
            isVerified: false
        };
        setRegistrationData(emptyData);
        clearStoredRegistrationData();
    };

    return (
        <RegistrationContext.Provider value={{
            registrationData,
            updateRegistrationData,
            goToNextStep,
            goToPreviousStep,
            resetRegistration
        }}>
            {children}
        </RegistrationContext.Provider>
    );
};

export const useRegistration = () => {
    const context = useContext(RegistrationContext);
    if (!context) {
        throw new Error('useRegistration must be used within a RegistrationProvider');
    }
    return context;
};
