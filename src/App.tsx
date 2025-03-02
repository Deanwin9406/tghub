
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { ComparisonProvider } from '@/contexts/ComparisonContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthGuard from '@/components/AuthGuard';
import { Toaster } from '@/components/ui/toaster';

// Pages
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import AuthPage from '@/pages/AuthPage';
import Search from '@/pages/Search';
import PropertyDetails from '@/pages/PropertyDetails';
import Dashboard from '@/pages/Dashboard';
import AgentDashboard from '@/pages/AgentDashboard';
import Profile from '@/pages/Profile';
import Favorites from '@/pages/Favorites';
import Comparison from '@/pages/Comparison';
import KycVerification from '@/pages/KycVerification';
import NotFound from '@/pages/NotFound';
import PropertyManagement from '@/pages/PropertyManagement';
import AddProperty from '@/pages/AddProperty';
import EditProperty from '@/pages/EditProperty';
import Maintenance from '@/pages/Maintenance';
import Payments from '@/pages/Payments';
import Leases from '@/pages/Leases';
import Messages from '@/pages/Messages';
import AgentProfile from '@/pages/AgentProfile';
import Agents from '@/pages/Agents';
import Communities from '@/pages/Communities';
import CommunityDetails from '@/pages/CommunityDetails';
import Vendors from '@/pages/Vendors';

import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <ComparisonProvider>
              <FavoritesProvider>
                <Router>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/auth-page" element={<AuthPage />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/property/:id" element={<PropertyDetails />} />
                    <Route path="/kyc-verification" element={<KycVerification />} />
                    <Route path="/agents" element={<Agents />} />
                    <Route path="/agent/:id" element={<AgentProfile />} />
                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="/comparison" element={<Comparison />} />
                    
                    {/* Protected routes */}
                    <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
                    <Route path="/agent-dashboard" element={<AuthGuard><AgentDashboard /></AuthGuard>} />
                    <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />
                    <Route path="/property-management" element={<AuthGuard><PropertyManagement /></AuthGuard>} />
                    <Route path="/property/add" element={<AuthGuard><AddProperty /></AuthGuard>} />
                    <Route path="/property/edit/:id" element={<AuthGuard><EditProperty /></AuthGuard>} />
                    <Route path="/maintenance" element={<AuthGuard><Maintenance /></AuthGuard>} />
                    <Route path="/payments" element={<AuthGuard><Payments /></AuthGuard>} />
                    <Route path="/leases" element={<AuthGuard><Leases /></AuthGuard>} />
                    <Route path="/messages" element={<AuthGuard><Messages /></AuthGuard>} />
                    <Route path="/communities" element={<AuthGuard><Communities /></AuthGuard>} />
                    <Route path="/community/:id" element={<AuthGuard><CommunityDetails /></AuthGuard>} />
                    <Route path="/vendors" element={<AuthGuard><Vendors /></AuthGuard>} />
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <Toaster />
                </Router>
              </FavoritesProvider>
            </ComparisonProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
