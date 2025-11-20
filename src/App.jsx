import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { RegistrationProvider } from './context/RegistrationContext';

// Eager load critical pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

// Lazy load all other pages for better initial load performance
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const RegisterPage2 = lazy(() => import('./pages/RegisterPage2'));
const RegisterPage3 = lazy(() => import('./pages/RegisterPage3'));
const VerificationPage = lazy(() => import('./pages/VerificationPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetVerificationPage = lazy(() => import('./pages/ResetVerificationPage'));
const CreateNewPasswordPage = lazy(() => import('./pages/CreateNewPasswordPage'));
const PasswordResetSuccessPage = lazy(() => import('./pages/PasswordResetSuccessPage'));
const Dashboard = lazy(() => import('./components/Dashboard/Dashboard'));
const AppointmentsPage = lazy(() => import('./pages/AppointmentsPage'));
const AppointmentDetailPage = lazy(() => import('./pages/AppointmentDetailPage'));
const BookingDetailPage = lazy(() => import('./pages/BookingDetailPage'));
const InspectionsPage = lazy(() => import('./pages/InspectionsPage'));
const InspectionDetailPage = lazy(() => import('./pages/InspectionDetailPage'));
const ChatsPage = lazy(() => import('./pages/ChatsPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const ResolutionNewDisputesPage = lazy(() => import('./pages/ResolutionNewDisputesPage'));
const ResolutionResolvedDisputesPage = lazy(() => import('./pages/ResolutionResolvedDisputesPage'));
const ResolutionDisputeChatPage = lazy(() => import('./pages/ResolutionDisputeChatPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const SettingsProfilePage = lazy(() => import('./pages/SettingsProfilePage'));
const SettingsServiceManagementPage = lazy(() => import('./pages/SettingsServiceManagementPage'));
const SettingsAccountPage = lazy(() => import('./pages/SettingsAccountPage'));
const SupportContactPage = lazy(() => import('./pages/SupportContactPage'));
const SupportChatPage = lazy(() => import('./pages/SupportChatPage'));

// Loading component for Suspense fallback
const PageLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontSize: '18px',
    color: '#666'
  }}>
    Loading...
  </div>
);

const App = () => {
  return (
    <AuthProvider>
      <RegistrationProvider>
        <Router>
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/register-step-2" element={<RegisterPage2 />} />
                <Route path="/register-step-3" element={<RegisterPage3 />} />
                <Route path="/verify-account" element={<VerificationPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-verification" element={<ResetVerificationPage />} />
                <Route path="/reset-password" element={<CreateNewPasswordPage />} />
                <Route path="/password-reset-success" element={<PasswordResetSuccessPage />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/bookings/:id" element={
                  <ProtectedRoute>
                    <BookingDetailPage />
                  </ProtectedRoute>
                } />
                <Route path="/appointments" element={
                  <ProtectedRoute>
                    <AppointmentsPage />
                  </ProtectedRoute>
                } />
                <Route path="/appointments/:id" element={
                  <ProtectedRoute>
                    <AppointmentDetailPage />
                  </ProtectedRoute>
                } />
                <Route path="/inspections" element={
                  <ProtectedRoute>
                    <InspectionsPage type="pending" />
                  </ProtectedRoute>
                } />
                <Route path="/inspections/pending" element={
                  <ProtectedRoute>
                    <InspectionsPage type="pending" />
                  </ProtectedRoute>
                } />
                <Route path="/inspections/completed" element={
                  <ProtectedRoute>
                    <InspectionsPage type="completed" />
                  </ProtectedRoute>
                } />
                <Route path="/inspections/:id" element={
                  <ProtectedRoute>
                    <InspectionDetailPage />
                  </ProtectedRoute>
                } />
                <Route path="/chats" element={
                  <ProtectedRoute>
                    <ChatsPage />
                  </ProtectedRoute>
                } />
                <Route path="/notifications" element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                } />
                <Route path="/resolution-center" element={
                  <ProtectedRoute>
                    <ResolutionNewDisputesPage />
                  </ProtectedRoute>
                } />
                <Route path="/resolution-center/new" element={
                  <ProtectedRoute>
                    <ResolutionNewDisputesPage />
                  </ProtectedRoute>
                } />
                <Route path="/resolution-center/resolved" element={
                  <ProtectedRoute>
                    <ResolutionResolvedDisputesPage />
                  </ProtectedRoute>
                } />
                <Route path="/resolution-center/disputes/:id" element={
                  <ProtectedRoute>
                    <ResolutionDisputeChatPage />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                <Route path="/settings/profile" element={<ProtectedRoute><SettingsProfilePage /></ProtectedRoute>} />
                <Route path="/settings/services" element={<ProtectedRoute><SettingsServiceManagementPage /></ProtectedRoute>} />   
                <Route path="/settings/account" element={<ProtectedRoute><SettingsAccountPage /></ProtectedRoute>} />
                <Route path="/support" element={<ProtectedRoute><SupportContactPage /></ProtectedRoute>} />
                <Route path="/support/contact" element={<ProtectedRoute><SupportContactPage /></ProtectedRoute>} />
                <Route path="/support/chat/:id" element={<ProtectedRoute><SupportChatPage /></ProtectedRoute>} />
              </Routes>
            </Suspense>
          </Layout>
        </Router>
      </RegistrationProvider>
    </AuthProvider>
  );
};

export default App;
