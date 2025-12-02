
import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import ThumbnailGenerator from './components/ThumbnailGenerator';

type View = 'landing' | 'app';

const App: React.FC = () => {
  // Simple state-based routing
  const [view, setView] = useState<View>('landing');

  return (
    <>
      {view === 'landing' ? (
        <LandingPage onStart={() => setView('app')} />
      ) : (
        <ThumbnailGenerator />
      )}
    </>
  );
};

export default App;
