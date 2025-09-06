'use client';

import { useCallback, useEffect, useState } from 'react';

export const useScrollToSection = () => {
  const [activeSection, setActiveSection] = useState<string>('home');

  // Smooth scroll to section
  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const navHeight = 80; // Height of fixed navigation
      const elementPosition = element.offsetTop - navHeight;
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  }, []);

  // Track active section based on scroll position with throttling
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    const handleScroll = () => {
      if (timeoutId) return; // Throttle scroll events
      
      timeoutId = setTimeout(() => {
        const sections = ['home', 'features', 'templates', 'pricing'];
        const scrollPosition = window.scrollY + 100; // Offset for better detection

        for (let i = sections.length - 1; i >= 0; i--) {
          const section = document.getElementById(sections[i]);
          if (section && section.offsetTop <= scrollPosition) {
            setActiveSection(sections[i]);
            break;
          }
        }
        timeoutId = null;
      }, 100); // Throttle to 10fps for section detection
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial position

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return { activeSection, scrollToSection };
};