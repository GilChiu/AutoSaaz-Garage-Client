import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RegisterPage2 from './pages/RegisterPage2';
import VerificationPage from './pages/VerificationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetVerificationPage from './pages/ResetVerificationPage';
import CreateNewPasswordPage from './pages/CreateNewPasswordPage';
import PasswordResetSuccessPage from './pages/PasswordResetSuccessPage';
import Dashboard from './components/Dashboard/Dashboard';
import AppointmentsPage from './pages/AppointmentsPage';
import AppointmentDetailPage from './pages/AppointmentDetailPage';
import InspectionsPage from './pages/InspectionsPage';
import InspectionDetailPage from './pages/InspectionDetailPage';
import ChatsPage from './pages/ChatsPage';
// import ResolutionCenterPage from './pages/ResolutionCenterPage'; // legacy placeholder (no longer used)
import ResolutionNewDisputesPage from './pages/ResolutionNewDisputesPage';
import ResolutionResolvedDisputesPage from './pages/ResolutionResolvedDisputesPage';
import ResolutionDisputeChatPage from './pages/ResolutionDisputeChatPage';
import SettingsPage from './pages/SettingsPage';
import SettingsProfilePage from './pages/SettingsProfilePage';
import SettingsServiceManagementPage from './pages/SettingsServiceManagementPage';
import SettingsAccountPage from './pages/SettingsAccountPage';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { RegistrationProvider } from './context/RegistrationContext';

const App = () => {
  return (
    <AuthProvider>
      <RegistrationProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/register-step-2" element={<RegisterPage2 />} />
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
            </Routes>
          </Layout>
        </Router>
      </RegistrationProvider>
    </AuthProvider>
  );
};

export default App;