
import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import ThumbnailGenerator from './components/ThumbnailGenerator';
import EmailCollectionModal from './components/EmailCollectionModal';
import { AuthProvider } from './contexts/AuthContext';
import { handleCheckoutSuccess, handleCheckoutCanceled } from './services/stripeService';

type View = 'landing' | 'email-collect' | 'app';

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

  // Show email collection modal when user clicks "Start Free Trial"
  const handleStart = () => {
    setView('email-collect');
  };

  // Handle email submission and proceed to app
  const handleEmailSubmit = (_email: string) => {
    // Email is stored in EmailCollectionModal via localStorage
    setView('app');
  };

  // Handle closing the email modal (go back to landing)
  const handleEmailModalClose = () => {
    setView('landing');
  };

  return (
    <>
      {view === 'landing' && <LandingPage onStart={handleStart} />}
      {view === 'app' && <ThumbnailGenerator initialCheckoutResult={checkoutResult} />}

      {/* Email Collection Modal */}
      <EmailCollectionModal
        isOpen={view === 'email-collect'}
        onSubmit={handleEmailSubmit}
        onClose={handleEmailModalClose}
      />
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
