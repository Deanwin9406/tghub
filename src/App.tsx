import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ComparisonProvider } from "@/contexts/ComparisonContext";
import AuthGuard from "@/components/AuthGuard";
import ComparisonButton from "@/components/ComparisonButton";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import PropertyManagement from "./pages/PropertyManagement";
import PropertyDetails from "./pages/PropertyDetails";
import Search from "./pages/Search";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import KycVerification from "./pages/KycVerification";
import Messages from "./pages/Messages";
import Maintenance from "./pages/Maintenance";
import Payments from "./pages/Payments";
import Leases from "./pages/Leases";
import Communities from "./pages/Communities";
import CommunityDetails from "./pages/CommunityDetails";
import Vendors from "./pages/Vendors";
import AgentDashboard from "./pages/AgentDashboard";
import Comparison from "./pages/Comparison";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ComparisonProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/search" element={<Search />} />
              <Route path="/property/:id" element={<PropertyDetails />} />
              <Route path="/compare" element={<Comparison />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
              <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />
              <Route path="/messages" element={<AuthGuard><Messages /></AuthGuard>} />
              <Route path="/kyc" element={<AuthGuard><KycVerification /></AuthGuard>} />
              <Route path="/maintenance" element={<AuthGuard><Maintenance /></AuthGuard>} />
              <Route path="/communities" element={<AuthGuard><Communities /></AuthGuard>} />
              <Route path="/community/:id" element={<AuthGuard><CommunityDetails /></AuthGuard>} />
              <Route path="/payments" element={<AuthGuard><Payments /></AuthGuard>} />
              <Route path="/leases" element={<AuthGuard><Leases /></AuthGuard>} />
              <Route path="/vendors" element={<AuthGuard><Vendors /></AuthGuard>} />
              <Route path="/property-management" element={<AuthGuard><PropertyManagement /></AuthGuard>} />
            
              {/* Agent Routes */}
              <Route path="/agent" element={<AuthGuard><AgentDashboard /></AuthGuard>} />
              <Route path="/agent/dashboard" element={<AuthGuard><AgentDashboard /></AuthGuard>} />
              
              {/* Catch-all Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <ComparisonButton />
          </BrowserRouter>
        </TooltipProvider>
      </ComparisonProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
