import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SessionTimeoutWarningProps {
  remainingTime: number; // in milliseconds
  onExtendSession: () => void;
  showWarning: boolean;
}

const SessionTimeoutWarning: React.FC<SessionTimeoutWarningProps> = ({
  remainingTime,
  onExtendSession,
  showWarning
}) => {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(remainingTime);

  useEffect(() => {
    setTimeLeft(remainingTime);
    
    if (showWarning && remainingTime > 0) {
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1000;
          return newTime > 0 ? newTime : 0;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [remainingTime, showWarning]);

  if (!showWarning) return null;

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  return (
    <div className="fixed top-4 right-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 shadow-lg z-[9999] max-w-sm">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
            Session Expiring Soon
          </h3>
          <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
            <div className="flex items-center space-x-1 mb-2">
              <Clock className="h-3 w-3" />
              <span>
                {minutes}:{seconds.toString().padStart(2, '0')} remaining
              </span>
            </div>
            <p className="text-xs">
              Your session will expire due to inactivity. Click below to extend it.
            </p>
          </div>
          <div className="mt-3">
            <button
              onClick={onExtendSession}
              className="w-full px-3 py-2 text-xs font-medium text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/50 hover:bg-amber-200 dark:hover:bg-amber-900/70 rounded-md transition-colors"
            >
              Extend Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutWarning;