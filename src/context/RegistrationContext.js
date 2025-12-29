import React, { createContext, useContext, useState } from 'react';

const RegistrationContext = createContext();

export const RegistrationProvider = ({ children }) => {
    const [registrationData, setRegistrationData] = useState({
        // Step 1: Personal Info (NO password here anymore)
        fullName: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        
        // Step 2: Business Location
        address: '',
        street: '',
        state: '',
        location: '',
        
        // Step 3: Business Details
        companyName: '',
        tradeLicense: '',
        vatCert: '',
        emiratesIdName: '',
        emiratesIdUrl: '',
        
        // Step 4: Verification (NO password - backend doesn't use it)
        verificationCode: '',
        
        // Session tracking
        sessionId: localStorage.getItem('registrationSessionId') || '',
        currentStep: 1
    });

    const updateRegistrationData = (data) => {
        setRegistrationData(prev => ({
            ...prev,
            ...data
        }));
    };

    const goToNextStep = () => {
        setRegistrationData(prev => ({
            ...prev,
            currentStep: prev.currentStep + 1
        }));
    };

    const goToPreviousStep = () => {
        setRegistrationData(prev => ({
            ...prev,
            currentStep: prev.currentStep - 1
        }));
    };

    const resetRegistration = () => {
        setRegistrationData({
            fullName: '',
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            address: '',
            street: '',
            state: '',
            location: '',
            companyName: '',
            tradeLicense: '',
            vatCert: '',
            emiratesIdName: '',
            emiratesIdUrl: '',
            verificationCode: '',
            sessionId: '',
            currentStep: 1
        });
        // Clear session data from localStorage
        localStorage.removeItem('registrationSessionId');
        localStorage.removeItem('sessionExpiresAt');
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
