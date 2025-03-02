
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ComparisonProvider } from "@/contexts/ComparisonContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import AuthGuard from '@/components/AuthGuard';
import Index from './pages/Index';
import Auth from './pages/Auth';
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

function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <ComparisonProvider>
          <FavoritesProvider>
            <Router>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
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
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
          </FavoritesProvider>
        </ComparisonProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
