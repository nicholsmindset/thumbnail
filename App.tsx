
import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import ThumbnailGenerator from './components/ThumbnailGenerator';
import { AuthProvider } from './contexts/AuthContext';
import { handleCheckoutSuccess, handleCheckoutCanceled } from './services/stripeService';
import { PLANS } from './constants';

type View = 'landing' | 'app';

const AppContent: React.FC = () => {
  // Simple state-based routing
  const [view, setView] = useState<View>('landing');
  const [checkoutResult, setCheckoutResult] = useState<{
    success?: boolean;
    planId?: string;
    canceled?: boolean;
  } | null>(null);

  // Handle Stripe checkout redirect results
  useEffect(() => {
    const successResult = handleCheckoutSuccess();
    if (successResult.success && successResult.planId) {
      // Find the plan to get credits
      const plan = PLANS.find((p) => p.id === successResult.planId);
      setCheckoutResult({
        success: true,
        planId: successResult.planId,
      });
      // Go directly to the app after successful checkout
      setView('app');
      return;
    }

    if (handleCheckoutCanceled()) {
      setCheckoutResult({ canceled: true });
    }
  }, []);

  // Pass checkout result to the app for handling credit updates
  const handleStart = () => {
    setView('app');
  };

  return (
    <>
      {view === 'landing' ? (
        <LandingPage onStart={handleStart} />
      ) : (
        <ThumbnailGenerator initialCheckoutResult={checkoutResult} />
      )}
    </>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
