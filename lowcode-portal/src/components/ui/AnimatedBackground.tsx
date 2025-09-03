'use client';

import React, { useEffect, useState } from 'react';

const AnimatedBackground: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [time, setTime] = useState(0);

  // Client-side hydration check
  useEffect(() => {
    setIsClient(true);
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

  // Track scroll position for parallax effect with throttling
  useEffect(() => {
    let rafId: number;
    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        setScrollY(window.scrollY);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);


  return (
    <div className="fixed inset-0 -z-10 overflow-hidden will-change-transform">
      {/* Ocean of Technology Base */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-400 via-blue-700 to-blue-950 dark:from-slate-700 dark:via-blue-950 dark:to-slate-900" />
      
      {/* Flying Drone Perspective Effect */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at center, transparent 10%, rgba(0,64,128,0.4) 70%),
            linear-gradient(180deg, 
              transparent 0%, 
              rgba(30, 64, 175, 0.3) 30%, 
              rgba(15, 39, 108, 0.5) 60%, 
              rgba(7, 23, 68, 0.7) 100%
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
                rgba(30, 64, 175, 0.4), 
                rgba(15, 39, 108, 0.4),
                rgba(30, 64, 175, 0.4), 
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
            className="absolute bg-blue-300/30 rounded-sm will-change-transform"
            style={{
              width: `${4 + depth * 8}px`,
              height: `${4 + depth * 8}px`,
              left: `${pseudoRandom2 * 100}%`,
              top: `${pseudoRandom3 * 100}%`,
              transform: `
                translate3d(
                  ${Math.sin(time * (0.5 + depth) + i) * 200 * depth}px,
                  ${Math.cos(time * (0.3 + depth) + i) * 150 * depth + scrollY * (0.2 + depth)}px,
                  0
                ) 
                rotateZ(${time * (50 + depth * 100)}deg)
                scale(${0.5 + depth})
              `,
              opacity: depth * 0.8,
              boxShadow: `0 0 ${10 + depth * 20}px rgba(30, 64, 175, ${depth * 0.6})`
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
              rgba(59, 130, 246, 0.1) 0%,
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
            linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
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
            className="absolute text-blue-300/50 font-mono font-bold pointer-events-none will-change-transform"
            style={{
              left: `${20 + (i * 15) % 60}%`,
              top: `${30 + (i * 10) % 40}%`,
              fontSize: `${1 + depth}rem`,
              transform: `
                translate3d(${offsetX}px, ${offsetY + scrollY * (0.1 + depth * 0.2)}px, 0) 
                rotateY(${time * (20 + i * 10)}deg) 
                scale(${0.8 + depth * 0.4})
              `,
              textShadow: `0 0 ${10 + depth * 20}px rgba(30, 64, 175, 0.8)`,
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
              rgba(30, 64, 175, 0.15) 0deg,
              transparent 60deg,
              rgba(15, 39, 108, 0.15) 120deg,
              transparent 180deg,
              rgba(30, 64, 175, 0.15) 240deg,
              transparent 300deg,
              rgba(30, 64, 175, 0.15) 360deg
            )
          `
        }}
      />

      {/* Depth Fog Effect */}
      <div 
        className="absolute inset-0 bg-gradient-to-t from-blue-950/40 via-transparent to-blue-400/15 dark:from-slate-950/60 dark:to-blue-950/20"
        style={{
          transform: `translateY(${scrollY * 0.2}px)`
        }}
      />
    </div>
  );
};

export default AnimatedBackground;