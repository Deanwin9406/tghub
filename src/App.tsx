
import React from 'react';
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

function App() {
  console.log("App rendering - routes should be set up");  // Debug App rendering
  
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
            
            {/* Protected routes */}
            <Route element={<AuthGuard />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/kyc" element={<KycVerification />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/add-property" element={<AddProperty />} />
              <Route path="/property-management" element={<PropertyManagement />} />
              <Route path="/property/edit/:id" element={<EditProperty />} />
              <Route path="/property/:propertyId/add-tenant" element={<AddTenant />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </FavoritesProvider>
      </ComparisonProvider>
    </AuthProvider>
  );
}

export default App;
