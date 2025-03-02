import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider"
import Index from './pages/Index';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import KycVerification from './pages/KycVerification';

function App() {
  // You can add any global state or context providers here if needed

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/kyc" element={<KycVerification />} />
          </Routes>
        </Router>
    </ThemeProvider>
  );
}

export default App;
