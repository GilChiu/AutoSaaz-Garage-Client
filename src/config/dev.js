// Development configuration
const DEV_CONFIG = {
  // Set to false to disable authentication for frontend development
  ENABLE_AUTH: true,
  
  // Supabase Functions base URL for API calls
  API_BASE_URL: process.env.REACT_APP_FUNCTIONS_URL || 'https://lblcjyeiwgyanadssqac.functions.supabase.co',
  
  // Mock user for development when auth is disabled
  MOCK_USER: {
    id: 1,
    email: 'dev@autosaaz.com',
    firstName: 'Developer',
    lastName: 'User',
    isVerified: true,
    businessName: 'Dev Garage',
    businessAddress: '123 Dev Street'
  }
};

export default DEV_CONFIG;
