
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import Search from '@/pages/Search';
import PropertyDetails from '@/pages/PropertyDetails';
import Auth from '@/pages/Auth';
import PropertyManagement from '@/pages/PropertyManagement';
import AddProperty from '@/pages/AddProperty';
import EditProperty from '@/pages/EditProperty';
import Dashboard from '@/pages/Dashboard';
import Favorites from '@/pages/Favorites';
import Comparison from '@/pages/Comparison';
import Agents from '@/pages/Agents';
import AgentProfile from '@/pages/AgentProfile';
import AgentDashboard from '@/pages/AgentDashboard';
import Communities from '@/pages/Communities';
import CommunityDetails from '@/pages/CommunityDetails';
import KycVerification from '@/pages/KycVerification';
import Profile from '@/pages/Profile';
import Vendors from '@/pages/Vendors';
import Messages from '@/pages/Messages';
import Maintenance from '@/pages/Maintenance';
import Payments from '@/pages/Payments';
import Leases from '@/pages/Leases';
import PropertyAssignments from '@/pages/PropertyAssignments';
import NotFound from '@/pages/NotFound';
import { AuthProvider } from '@/contexts/AuthContext';
import { ComparisonProvider } from '@/contexts/ComparisonContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import VendorDashboard from '@/pages/VendorDashboard';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="togoprop-theme">
        <AuthProvider>
          <ComparisonProvider>
            <FavoritesProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/property/:id" element={<PropertyDetails />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/property-management" element={<PropertyManagement />} />
                  <Route path="/add-property" element={<AddProperty />} />
                  <Route path="/edit-property/:id" element={<EditProperty />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/vendor-dashboard" element={<VendorDashboard />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/comparison" element={<Comparison />} />
                  <Route path="/agents" element={<Agents />} />
                  <Route path="/agents/:id" element={<AgentProfile />} />
                  <Route path="/agent-dashboard" element={<AgentDashboard />} />
                  <Route path="/communities" element={<Communities />} />
                  <Route path="/communities/:id" element={<CommunityDetails />} />
                  <Route path="/kyc-verification" element={<KycVerification />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/vendors" element={<Vendors />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/maintenance" element={<Maintenance />} />
                  <Route path="/payments" element={<Payments />} />
                  <Route path="/leases" element={<Leases />} />
                  <Route path="/property-assignments" element={<PropertyAssignments />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
              <Toaster />
            </FavoritesProvider>
          </ComparisonProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
