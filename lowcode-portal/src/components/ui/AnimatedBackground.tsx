'use client';

import React, { useEffect, useState } from 'react';

const AnimatedBackground: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [time, setTime] = useState(0);
  const [oceanColors, setOceanColors] = useState({
    primary: 'rgba(59, 130, 246, 0.8)',
    secondary: 'rgba(30, 64, 175, 0.6)',
    deep: 'rgba(15, 39, 108, 0.7)'
  });

  // Dark programmer-themed ocean color palettes
  const getRandomOceanColors = () => {
    const oceanPalettes = [
      // Deep Code Blue
      {
        primary: 'rgba(30, 58, 138, 0.9)',
        secondary: 'rgba(15, 23, 42, 0.8)',
        deep: 'rgba(8, 13, 30, 0.9)',
        name: 'Deep Code Blue'
      },
      // Matrix Green
      {
        primary: 'rgba(34, 197, 94, 0.8)',
        secondary: 'rgba(5, 46, 22, 0.9)',
        deep: 'rgba(2, 20, 8, 0.9)',
        name: 'Matrix Green'
      },
      // Cyber Purple
      {
        primary: 'rgba(109, 40, 217, 0.9)',
        secondary: 'rgba(55, 16, 109, 0.9)',
        deep: 'rgba(24, 5, 48, 0.9)',
        name: 'Cyber Purple'
      },
      // Terminal Black
      {
        primary: 'rgba(51, 65, 85, 0.9)',
        secondary: 'rgba(30, 41, 59, 0.9)',
        deep: 'rgba(15, 23, 42, 0.9)',
        name: 'Terminal Black'
      },
      // Neon Cyan
      {
        primary: 'rgba(6, 182, 212, 0.8)',
        secondary: 'rgba(8, 51, 68, 0.9)',
        deep: 'rgba(4, 25, 34, 0.9)',
        name: 'Neon Cyan'
      },
      // Hacker Red
      {
        primary: 'rgba(220, 38, 127, 0.8)',
        secondary: 'rgba(136, 19, 55, 0.9)',
        deep: 'rgba(55, 8, 23, 0.9)',
        name: 'Hacker Red'
      },
      // Electric Orange
      {
        primary: 'rgba(234, 88, 12, 0.8)',
        secondary: 'rgba(124, 45, 18, 0.9)',
        deep: 'rgba(67, 20, 7, 0.9)',
        name: 'Electric Orange'
      },
      // Dark Void
      {
        primary: 'rgba(75, 85, 99, 0.8)',
        secondary: 'rgba(31, 41, 55, 0.9)',
        deep: 'rgba(17, 24, 39, 0.9)',
        name: 'Dark Void'
      }
    ];

    const randomIndex = Math.floor(Math.random() * oceanPalettes.length);
    return oceanPalettes[randomIndex];
  };

  // Client-side hydration check and random color initialization
  useEffect(() => {
    setIsClient(true);
    // Set random colors on initial load
    const randomColors = getRandomOceanColors();
    setOceanColors(randomColors);
    console.log(`💻 Dark Programmer Ocean theme: ${randomColors.name}`);
  }, []);

  // Animation time for drone movement
  useEffect(() => {
    let animationId: number;
    const startTime = Date.now();
    
    const updateTime = () => {
      setTime((Date.now() - startTime) / 1000);
      animationId = requestAnimationFrame(updateTime);
    };
    
    animationId = requestAnimationFrame(updateTime);
    
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  // Track scroll position for parallax effect with optimized throttling
  useEffect(() => {
    let rafId: number | null = null;
    let lastScrollTime = 0;
    const throttleDelay = 16; // ~60fps
    
    const handleScroll = () => {
      const now = performance.now();
      if (now - lastScrollTime < throttleDelay) return;
      
      if (rafId !== null) return; // Prevent multiple RAF calls
      
      rafId = requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        lastScrollTime = performance.now();
        rafId = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);


  return (
    <div className="fixed inset-0 -z-10 overflow-hidden will-change-transform" style={{ contain: 'layout style paint' }}>
      {/* Ocean of Technology Base */}
      <div 
        className="absolute inset-0 transition-colors duration-1000 ease-in-out"
        style={{
          background: `linear-gradient(to bottom, ${oceanColors.primary}, ${oceanColors.secondary}, ${oceanColors.deep})`
        }}
      />
      
      {/* Flying Drone Perspective Effect */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at center, transparent 10%, ${oceanColors.secondary} 70%),
            linear-gradient(180deg, 
              transparent 0%, 
              ${oceanColors.primary} 30%, 
              ${oceanColors.secondary} 60%, 
              ${oceanColors.deep} 100%
            )
          `,
          transform: `perspective(1000px) rotateX(${Math.sin(time * 0.3) * 5 + 15}deg) translateZ(${scrollY * -0.5}px)`
        }}
      />

      {/* Technology Ocean Waves */}
      <div className="absolute inset-0">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-full h-32 opacity-20"
            style={{
              bottom: `${i * 15}%`,
              background: `linear-gradient(90deg, 
                transparent, 
                ${oceanColors.primary}, 
                ${oceanColors.secondary},
                ${oceanColors.primary}, 
                transparent
              )`,
              transform: `
                translateX(${Math.sin(time * 0.5 + i * 0.8) * 100}px) 
                translateY(${Math.cos(time * 0.3 + i * 0.5) * 20}px)
                scaleY(${0.5 + Math.sin(time * 0.4 + i) * 0.3})
              `,
              borderRadius: '50px',
              filter: 'blur(2px)'
            }}
          />
        ))}
      </div>

      {/* Flying Technology Particles */}
      {isClient && [...Array(20)].map((_, i) => {
        const seed = i * 147.258;
        const pseudoRandom1 = (Math.sin(seed) + 1) / 2;
        const pseudoRandom2 = (Math.sin(seed * 2) + 1) / 2;
        const pseudoRandom3 = (Math.sin(seed * 3) + 1) / 2;
        const depth = pseudoRandom1 * 0.8 + 0.2;
        
        return (
          <div
            key={i}
            className="absolute rounded-sm will-change-transform"
            style={{
              width: `${4 + depth * 8}px`,
              height: `${4 + depth * 8}px`,
              left: `${pseudoRandom2 * 100}%`,
              top: `${pseudoRandom3 * 100}%`,
              backgroundColor: oceanColors.primary,
              transform: `
                translate3d(
                  ${Math.sin(time * (0.5 + depth) + i) * 200 * depth}px,
                  ${Math.cos(time * (0.3 + depth) + i) * 150 * depth + scrollY * (0.2 + depth)}px,
                  0
                ) 
                rotateZ(${time * (50 + depth * 100)}deg)
                scale(${0.5 + depth})
              `,
              opacity: depth * 0.5,
              boxShadow: `0 0 ${10 + depth * 20}px ${oceanColors.secondary}`
            }}
          />
        );
      })}

      {/* Drone Flight Path Effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(
              circle at ${50 + Math.sin(time * 0.8) * 20}% ${50 + Math.cos(time * 0.6) * 15}%,
              ${oceanColors.primary.replace('0.8', '0.1')} 0%,
              transparent 30%
            )
          `,
          transform: `translateZ(${Math.sin(time * 0.5) * 100}px)`
        }}
      />

      {/* Technology Grid Ocean Floor */}
      <div 
        className="absolute inset-0 opacity-10 dark:opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(${oceanColors.primary.replace('0.8', '0.3')} 1px, transparent 1px),
            linear-gradient(90deg, ${oceanColors.primary.replace('0.8', '0.3')} 1px, transparent 1px)
          `,
          backgroundSize: `${150 + Math.sin(time * 0.3) * 50}px ${150 + Math.cos(time * 0.4) * 50}px`,
          transform: `
            perspective(500px) 
            rotateX(60deg) 
            translateY(${200 + scrollY * 0.3}px) 
            translateZ(${Math.sin(time * 0.2) * 100}px)
          `
        }}
      />

      {/* Floating Code Blocks as Islands */}
      {isClient && ['{ }', '< >', '[ ]', 'fn', 'AI', 'DB'].map((symbol, i) => {
        const offsetX = Math.sin(time * 0.4 + i * 1.2) * 300;
        const offsetY = Math.cos(time * 0.3 + i * 0.8) * 100;
        const depth = 0.3 + (i % 3) * 0.3;
        
        return (
          <div
            key={symbol}
            className="absolute font-mono font-bold pointer-events-none will-change-transform"
            style={{
              left: `${20 + (i * 15) % 60}%`,
              top: `${30 + (i * 10) % 40}%`,
              fontSize: `${1 + depth}rem`,
              color: oceanColors.primary.replace('0.8', '0.5'),
              transform: `
                translate3d(${offsetX}px, ${offsetY + scrollY * (0.1 + depth * 0.2)}px, 0) 
                rotateY(${time * (20 + i * 10)}deg) 
                scale(${0.8 + depth * 0.4})
              `,
              textShadow: `0 0 ${10 + depth * 20}px ${oceanColors.secondary}`,
              opacity: 0.6 + Math.sin(time + i) * 0.3
            }}
          >
            {symbol}
          </div>
        );
      })}

      {/* Drone Shadow/Light Beam */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            conic-gradient(
              from ${time * 30}deg at ${50 + Math.sin(time * 0.7) * 25}% ${40 + Math.cos(time * 0.5) * 20}%,
              ${oceanColors.primary.replace('0.8', '0.15')} 0deg,
              transparent 60deg,
              ${oceanColors.secondary.replace('0.6', '0.15')} 120deg,
              transparent 180deg,
              ${oceanColors.primary.replace('0.8', '0.15')} 240deg,
              transparent 300deg,
              ${oceanColors.primary.replace('0.8', '0.15')} 360deg
            )
          `
        }}
      />

      {/* Depth Fog Effect */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top, ${oceanColors.deep.replace('0.7', '0.4')}, transparent, ${oceanColors.primary.replace('0.8', '0.15')})`,
          transform: `translateY(${scrollY * 0.2}px)`
        }}
      />
    </div>
  );
};

export default AnimatedBackground;