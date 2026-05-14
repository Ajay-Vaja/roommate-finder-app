import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import PropertyList from '../pages/PropertyList';
import Matches from '../pages/Matches';
import AdminDashboard from '../pages/AdminDashboard';
import Onboarding from '../pages/Onboarding';
import PostProperty from '../pages/PostProperty';
import PropertyDetails from '../pages/PropertyDetails';
import PublicProfile from '../pages/PublicProfile';
import SavedProperties from '../pages/SavedProperties';
import ManageProperties from '../pages/ManageProperties';
import EditProperty from '../pages/EditProperty';

// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const location = window.location.pathname;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If profile is incomplete, force them to onboarding (unless they are already there or are Admin)
  if (!user.is_profile_complete && user.role !== 'Admin' && location !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // If Admin is on onboarding page, redirect them to admin dashboard
  if (user.role === 'Admin' && location === '/onboarding') {
    return <Navigate to="/admin-dashboard" replace />;
  }

  return children;
};

const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/properties" replace />;
  if (user.role === 'Admin') return <Navigate to="/admin-dashboard" replace />;
  return <Navigate to="/profile" replace />;
};

const AppRoutes = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/properties" element={<PropertyList />} />
        <Route path="/properties/:id" element={<PropertyDetails />} />
        <Route path="/profile/:id" element={<ProtectedRoute><PublicProfile /></ProtectedRoute>} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
        <Route path="/matches" element={
          <ProtectedRoute><Matches /></ProtectedRoute>
        } />
        
        <Route path="/onboarding" element={
          <ProtectedRoute><Onboarding /></ProtectedRoute>
        } />

        <Route path="/post-property" element={
          <ProtectedRoute><PostProperty /></ProtectedRoute>
        } />

        <Route path="/saved-properties" element={
          <ProtectedRoute><SavedProperties /></ProtectedRoute>
        } />

        <Route path="/manage-properties" element={
          <ProtectedRoute><ManageProperties /></ProtectedRoute>
        } />

        <Route path="/edit-property/:id" element={
          <ProtectedRoute><EditProperty /></ProtectedRoute>
        } />
        
        {/* React Admin Panel Route */}
         <Route path="/admin-dashboard" element={
          <ProtectedRoute><AdminDashboard /></ProtectedRoute>
        } />

        {/* Safety redirect for common typos/spaces */}
        <Route path="/admin dashboard" element={<Navigate to="/admin-dashboard" replace />} />

      </Routes>
    </>
  );
};

export default AppRoutes;
