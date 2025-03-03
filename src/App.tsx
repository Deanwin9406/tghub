
import React, { memo } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from "@/contexts/AuthContext";
import { ComparisonProvider } from "@/contexts/ComparisonContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import AuthGuard from '@/components/AuthGuard';
import Index from './pages/Index';
import Profile from './pages/Profile';
import KycVerification from './pages/KycVerification';
import Communities from './pages/Communities';
import CommunityDetails from './pages/CommunityDetails';
import Favorites from './pages/Favorites';
import Dashboard from './pages/Dashboard';
import PropertyDetails from './pages/PropertyDetails';
import Search from './pages/Search';
import Agents from './pages/Agents';
import Vendors from './pages/Vendors';
import AgentProfile from './pages/AgentProfile';
import AddProperty from './pages/AddProperty';
import PropertyManagement from './pages/PropertyManagement';
import EditProperty from './pages/EditProperty';
import NotFound from './pages/NotFound';
import AddTenant from './pages/AddTenant';

// Memoize page components to reduce re-renders
const MemoizedDashboard = memo(Dashboard);
const MemoizedProfile = memo(Profile);
const MemoizedKycVerification = memo(KycVerification);
const MemoizedPropertyManagement = memo(PropertyManagement);
const MemoizedAddProperty = memo(AddProperty);
const MemoizedEditProperty = memo(EditProperty);
const MemoizedAddTenant = memo(AddTenant);

function App() {
  console.log("App rendering - routes setup");  // Debug App rendering
  
  return (
    <AuthProvider>
      <ComparisonProvider>
        <FavoritesProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/communities" element={<Communities />} />
            <Route path="/communities/:id" element={<CommunityDetails />} />
            <Route path="/search" element={<Search />} />
            <Route path="/property/:id" element={<PropertyDetails />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/agents/:id" element={<AgentProfile />} />
            <Route path="/vendors" element={<Vendors />} />
            
            {/* Protected routes - using memoized components to reduce re-renders */}
            <Route element={<AuthGuard />}>
              <Route path="/profile" element={<MemoizedProfile />} />
              <Route path="/kyc" element={<MemoizedKycVerification />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/dashboard" element={<MemoizedDashboard />} />
              <Route path="/add-property" element={<MemoizedAddProperty />} />
              <Route path="/property-management" element={<MemoizedPropertyManagement />} />
              <Route path="/property/edit/:id" element={<MemoizedEditProperty />} />
              <Route path="/property/:propertyId/add-tenant" element={<MemoizedAddTenant />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </FavoritesProvider>
      </ComparisonProvider>
    </AuthProvider>
  );
}

export default App;
