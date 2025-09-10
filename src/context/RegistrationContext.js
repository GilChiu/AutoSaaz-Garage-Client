import React, { createContext, useContext, useState } from 'react';

const RegistrationContext = createContext();

export const RegistrationProvider = ({ children }) => {
    const [registrationData, setRegistrationData] = useState({
        // Step 1: Personal Info
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        
        // Step 2: Business Location
        address: '',
        street: '',
        state: '',
        location: '',
        
        // Step 3: Verification
        verificationCode: '',
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
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            phone: '',
            address: '',
            street: '',
            state: '',
            location: '',
            verificationCode: '',
            currentStep: 1
        });
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
