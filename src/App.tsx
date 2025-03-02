
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { ComparisonProvider } from "@/contexts/ComparisonContext";
import AuthGuard from "@/components/AuthGuard";

// Pages
import Index from "@/pages/Index";
import PropertyDetails from "@/pages/PropertyDetails";
import AddProperty from "@/pages/AddProperty";
import EditProperty from "@/pages/EditProperty";
import Search from "@/pages/Search";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Favorites from "@/pages/Favorites";
import Comparison from "@/pages/Comparison";
import Messages from "@/pages/Messages";
import NotFound from "@/pages/NotFound";
import Maintenance from "@/pages/Maintenance";
import PropertyManagement from "@/pages/PropertyManagement";
import Payments from "@/pages/Payments";
import Leases from "@/pages/Leases";
import KycVerification from "@/pages/KycVerification";
import Agents from "@/pages/Agents";
import AgentProfile from "@/pages/AgentProfile";
import Communities from "@/pages/Communities";
import CommunityDetails from "@/pages/CommunityDetails";
import AgentDashboard from "@/pages/AgentDashboard";
import Vendors from "@/pages/Vendors";
import PropertyAssignments from "@/pages/PropertyAssignments";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <FavoritesProvider>
            <ComparisonProvider>
              <Router>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/property/:id" element={<PropertyDetails />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/comparison" element={<Comparison />} />
                  <Route path="/agents" element={<Agents />} />
                  <Route path="/agent/:id" element={<AgentProfile />} />
                  <Route path="/vendors" element={<Vendors />} />
                  <Route path="/communities" element={<Communities />} />
                  <Route path="/community/:id" element={<CommunityDetails />} />
                  
                  {/* Protected Routes */}
                  <Route element={<AuthGuard />}>
                    <Route path="/property/add" element={<AddProperty />} />
                    <Route path="/property/edit/:id" element={<EditProperty />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/maintenance" element={<Maintenance />} />
                    <Route path="/property-management" element={<PropertyManagement />} />
                    <Route path="/property-assignments" element={<PropertyAssignments />} />
                    <Route path="/payments" element={<Payments />} />
                    <Route path="/leases" element={<Leases />} />
                    <Route path="/kyc" element={<KycVerification />} />
                    <Route path="/agent-dashboard" element={<AgentDashboard />} />
                  </Route>
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Router>
              <Toaster />
            </ComparisonProvider>
          </FavoritesProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
