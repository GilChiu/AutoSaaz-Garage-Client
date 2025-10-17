// Clear all authentication tokens
// Run this in the browser console to clear all auth state

console.log('Clearing all authentication data...');

// Clear localStorage
const keysToRemove = [
    'token',
    'accessToken', 
    'refreshToken',
    'user',
    'profile'
];

keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
        console.log(`Removing ${key} from localStorage`);
        localStorage.removeItem(key);
    }
});

// Clear sessionStorage
keysToRemove.forEach(key => {
    if (sessionStorage.getItem(key)) {
        console.log(`Removing ${key} from sessionStorage`);
        sessionStorage.removeItem(key);
    }
});

console.log('Authentication data cleared. Please refresh the page.');