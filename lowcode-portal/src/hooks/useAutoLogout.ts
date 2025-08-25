import { useEffect, useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UseAutoLogoutOptions {
  timeout?: number; // in milliseconds, default 5 minutes
  warningTime?: number; // show warning X milliseconds before timeout, default 1 minute
  events?: string[]; // events to track for activity
  onLogout?: () => void; // callback when auto logout happens
  onWarning?: () => void; // callback when warning should be shown
  isAuthenticated: boolean; // pass authentication state from parent
  logout: () => void; // pass logout function from parent
}

export const useAutoLogout = (options: UseAutoLogoutOptions) => {
  const {
    timeout = 5 * 60 * 1000, // 5 minutes in milliseconds
    warningTime = 60 * 1000, // 1 minute warning
    events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'],
    onLogout,
    onWarning,
    isAuthenticated,
    logout
  } = options;

  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(timeout);

  const performAutoLogout = useCallback(() => {
    if (isAuthenticated) {
      console.log('Auto-logout: Session expired due to inactivity');
      logout(); // No confirmation modal for auto logout
      
      // Clear any stored auth data
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      // Call custom callback if provided
      if (onLogout) {
        onLogout();
      }
      
      // Redirect to login page
      router.push('/login');
    }
  }, [logout, isAuthenticated, onLogout, router]);

  const showWarningCallback = useCallback(() => {
    setShowWarning(true);
    setRemainingTime(warningTime);
    if (onWarning) {
      onWarning();
    }

    // Start countdown for remaining time
    const countdownInterval = setInterval(() => {
      setRemainingTime(prev => {
        const newTime = prev - 1000;
        if (newTime <= 0) {
          clearInterval(countdownInterval);
          return 0;
        }
        return newTime;
      });
    }, 1000);

    // Auto-clear countdown when logout happens
    setTimeout(() => {
      clearInterval(countdownInterval);
    }, warningTime);
  }, [warningTime, onWarning]);

  const resetTimeout = useCallback(() => {
    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Hide warning and reset remaining time
    setShowWarning(false);
    setRemainingTime(timeout);

    // Update last activity time
    lastActivityRef.current = Date.now();

    // Set new timeout only if user is authenticated
    if (isAuthenticated) {
      // Set warning timeout
      const warningDelay = timeout - warningTime;
      if (warningDelay > 0) {
        warningTimeoutRef.current = setTimeout(showWarningCallback, warningDelay);
      }
      
      // Set logout timeout
      timeoutRef.current = setTimeout(performAutoLogout, timeout);
    }
  }, [timeout, warningTime, performAutoLogout, showWarningCallback, isAuthenticated]);

  const handleActivity = useCallback((event: Event) => {
    resetTimeout();
  }, [resetTimeout]);

  useEffect(() => {
    // Only set up activity tracking if user is authenticated
    if (!isAuthenticated) {
      // Clear timeout if user is not authenticated
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
        warningTimeoutRef.current = null;
      }
      return;
    }
    
    // Add event listeners for activity tracking
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Set initial timeout only once when authenticated
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Hide warning and reset remaining time
    setShowWarning(false);
    setRemainingTime(timeout);

    // Update last activity time
    lastActivityRef.current = Date.now();

    // Set warning timeout
    const warningDelay = timeout - warningTime;
    if (warningDelay > 0) {
      warningTimeoutRef.current = setTimeout(showWarningCallback, warningDelay);
    }
    
    // Set logout timeout
    timeoutRef.current = setTimeout(performAutoLogout, timeout);

    // Cleanup function
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [isAuthenticated]); // Only depend on isAuthenticated, not resetTimeout

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, []);

  // Return utility functions for manual control
  return {
    resetTimeout,
    getLastActivity: () => lastActivityRef.current,
    getRemainingTime: () => {
      if (showWarning) {
        return remainingTime;
      }
      const elapsed = Date.now() - lastActivityRef.current;
      return Math.max(0, timeout - elapsed);
    },
    showWarning,
    remainingTime
  };
};

export default useAutoLogout;