import React, { createContext, useContext, useState, ReactNode } from "react";

interface ProgressBarContextType {
  isVisible: boolean;
  progress: number;
  startProgressBar: () => void;
  stopProgressBar: () => void;
  setProgressBarProgress: (value: number) => void;
}

const ProgressBarContext = createContext<ProgressBarContextType | undefined>(undefined);

export const useProgressBar = (): ProgressBarContextType => {
  const context = useContext(ProgressBarContext);
  if (!context) {
    throw new Error("useProgressBar must be used within a ProgressBarProvider");
  }
  return context;
};

interface ProgressBarProviderProps {
  children: ReactNode;
}

export const ProgressBarProvider: React.FC<ProgressBarProviderProps> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const startProgressBar = () => {
    setIsVisible(true);
    setProgress(5);
  };

  const stopProgressBar = () => {
    setIsVisible(false);
    setProgress(0);
  };

  const setProgressBarProgress = (value: number) => {
    setIsVisible(true);
    setProgress(value);
  };

  const contextValue: ProgressBarContextType = {
    isVisible,
    progress,
    startProgressBar,
    stopProgressBar,
    setProgressBarProgress,
  };

  return <ProgressBarContext.Provider value={contextValue}>{children}</ProgressBarContext.Provider>;
};
