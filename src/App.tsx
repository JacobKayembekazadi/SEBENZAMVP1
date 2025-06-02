import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Cases from "./pages/Cases";
import Calendar from "./pages/Calendar";
import Documents from "./pages/Documents";
import Messages from "./pages/Messages";
import Help from "./pages/Help";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import TimeTracking from "./pages/TimeTracking";
import Invoices from "./pages/Invoices";
import Estimates from "./pages/Estimates";
import Expenses from "./pages/Expenses";
import Accounting from "./pages/Accounting";
import Settings from "./pages/Settings";
import MyPackagePage from "./pages/MyPackagePage";
import { EnhancedAIAssistant } from "./components/ai/EnhancedAIAssistant";
import { AppProvider, useUser } from "./lib/store";
import { LoginForm } from "./components/auth/LoginForm";
import { WelcomeDialog } from "./components/onboarding/WelcomeDialog";
import { OnboardingTour } from "./components/onboarding/OnboardingTour";
import { ProfileCompletion } from "./components/profile/ProfileCompletion";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Auth wrapper component
function AuthenticatedApp() {
  const user = useUser();
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<'welcome' | 'profile' | 'tour' | 'completed'>('welcome');

  useEffect(() => {
    if (user) {
      // Check user preferences for onboarding
      const preferences = localStorage.getItem('user_preferences');
      let userPrefs = { needsTour: false, profileComplete: true };
      
      if (preferences) {
        try {
          userPrefs = JSON.parse(preferences);
        } catch (e) {
          console.warn('Failed to parse user preferences');
        }
      }

      // Determine onboarding flow
      const isFirstLogin = user.email === 'newuser@example.com'; // Demo logic
      const profileComplete = user.email === 'complete@example.com'; // Demo logic
      
      if (isFirstLogin || userPrefs.needsTour) {
        setShowWelcome(true);
        setOnboardingStep('welcome');
      } else if (!profileComplete) {
        setShowProfileCompletion(true);
        setOnboardingStep('profile');
      } else {
        setOnboardingStep('completed');
      }
    }
  }, [user]);

  const handleWelcomeStartTour = () => {
    setShowWelcome(false);
    setShowTour(true);
    setOnboardingStep('tour');
  };

  const handleWelcomeSkipTour = () => {
    setShowWelcome(false);
    
    // Check if profile needs completion
    const profileComplete = user?.email === 'complete@example.com';
    if (!profileComplete) {
      setShowProfileCompletion(true);
      setOnboardingStep('profile');
    } else {
      setOnboardingStep('completed');
    }
  };

  const handleWelcomeCompleteProfile = () => {
    setShowWelcome(false);
    setShowProfileCompletion(true);
    setOnboardingStep('profile');
  };

  const handleTourComplete = () => {
    setShowTour(false);
    
    // Check if profile needs completion
    const profileComplete = user?.email === 'complete@example.com';
    if (!profileComplete) {
      setShowProfileCompletion(true);
      setOnboardingStep('profile');
    } else {
      setOnboardingStep('completed');
      // Save tour completion
      localStorage.setItem('user_preferences', JSON.stringify({
        needsTour: false,
        profileComplete: true,
        tourCompleted: true,
        lastLogin: new Date().toISOString(),
      }));
    }
  };

  const handleTourSkip = () => {
    setShowTour(false);
    
    // Check if profile needs completion
    const profileComplete = user?.email === 'complete@example.com';
    if (!profileComplete) {
      setShowProfileCompletion(true);
      setOnboardingStep('profile');
    } else {
      setOnboardingStep('completed');
    }
  };

  const handleProfileComplete = (profileData: any) => {
    setShowProfileCompletion(false);
    setOnboardingStep('completed');
    
    // Save profile completion
    localStorage.setItem('user_preferences', JSON.stringify({
      needsTour: false,
      profileComplete: true,
      profileData,
      lastLogin: new Date().toISOString(),
    }));
  };

  const handleProfileSkip = () => {
    setShowProfileCompletion(false);
    setOnboardingStep('completed');
  };

  const calculateProfileCompleteness = (): number => {
    if (!user) return 0;
    
    // Demo calculation - replace with actual logic
    if (user.email === 'complete@example.com') return 100;
    if (user.email === 'newuser@example.com') return 20;
    return 60;
  };

  return (
    <>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/create" element={<Clients />} />
          <Route path="/cases" element={<Cases />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/help" element={<Help />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/time" element={<TimeTracking />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/invoices/create" element={<Invoices />} />
          <Route path="/estimates" element={<Estimates />} />
          <Route path="/estimates/create" element={<Estimates />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/expenses/create" element={<Expenses />} />
          <Route path="/accounting" element={<Accounting />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/connect-bank" element={<Settings />} />
          <Route path="/settings/payment-gateways" element={<Settings />} />
          <Route path="/my-package" element={<MyPackagePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
        <EnhancedAIAssistant />
    </TooltipProvider>

      {/* Onboarding Components */}
      <WelcomeDialog
        isOpen={showWelcome}
        userName={user?.firstName || 'User'}
        profileCompleteness={calculateProfileCompleteness()}
        isFirstLogin={user?.email === 'newuser@example.com'}
        onStartTour={handleWelcomeStartTour}
        onSkipTour={handleWelcomeSkipTour}
        onCompleteProfile={handleWelcomeCompleteProfile}
      />

      <OnboardingTour
        isOpen={showTour}
        onComplete={handleTourComplete}
        onSkip={handleTourSkip}
      />

      <ProfileCompletion
        isOpen={showProfileCompletion}
        initialData={{
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          email: user?.email || '',
        }}
        onComplete={handleProfileComplete}
        onSkip={handleProfileSkip}
      />
    </>
  );
}

// Main App component
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing authentication
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        {isAuthenticated ? (
          <AuthenticatedApp />
        ) : (
          <LoginForm onSuccess={handleLoginSuccess} />
        )}
      </AppProvider>
  </QueryClientProvider>
);
};

export default App;
