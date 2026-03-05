import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';

const TutorialContext = createContext();

export function TutorialProvider({ children }) {
  const { currentUser } = useAuth();
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

  // Check if user has seen tutorial before
  useEffect(() => {
    if (currentUser) {
      const tutorialKey = `tutorial_seen_${currentUser.id}`;
      const seen = localStorage.getItem(tutorialKey);
      setHasSeenTutorial(seen === 'true');
      
      // Auto-start tutorial for new users
      if (!seen) {
        // Delay to let the page load
        setTimeout(() => {
          setIsTutorialActive(true);
        }, 1000);
      }
    }
  }, [currentUser]);

  const startTutorial = () => {
    setCurrentStep(0);
    setIsTutorialActive(true);
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const skipTutorial = () => {
    setIsTutorialActive(false);
    if (currentUser) {
      const tutorialKey = `tutorial_seen_${currentUser.id}`;
      localStorage.setItem(tutorialKey, 'true');
      setHasSeenTutorial(true);
    }
  };

  const completeTutorial = () => {
    setIsTutorialActive(false);
    if (currentUser) {
      const tutorialKey = `tutorial_seen_${currentUser.id}`;
      localStorage.setItem(tutorialKey, 'true');
      setHasSeenTutorial(true);
    }
  };

  const resetTutorial = () => {
    if (currentUser) {
      const tutorialKey = `tutorial_seen_${currentUser.id}`;
      localStorage.removeItem(tutorialKey);
      setHasSeenTutorial(false);
    }
  };

  return (
    <TutorialContext.Provider
      value={{
        isTutorialActive,
        currentStep,
        hasSeenTutorial,
        startTutorial,
        nextStep,
        prevStep,
        skipTutorial,
        completeTutorial,
        resetTutorial,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within TutorialProvider');
  }
  return context;
}
