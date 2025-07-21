"use client";

import React, { useEffect, useState, useRef } from 'react';

interface AnimatedHeaderProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const AnimatedHeader: React.FC<AnimatedHeaderProps> = ({ children, className = '', size = 'md' }) => {
  const [fillProgress, setFillProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl md:text-5xl'
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 1500; // 1.5 seconds
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / duration) * 100, 100);
        
        setFillProgress(progress);
        
        if (progress < 100) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`flex justify-center w-full ${className}`}>
      <div className="relative inline-block" ref={containerRef}>
      {/* White background - simple rounded bottom */}
      <div 
        className="absolute inset-0 bg-white"
        style={{
          borderRadius: '0 0 20px 20px',
        }}
      />
      
      {/* Top inverted corners overlay */}
      <div className="absolute top-0 left-0 w-5 h-5 bg-transparent">
        <div className="w-5 h-5 bg-white rounded-br-full"></div>
      </div>
      <div className="absolute top-0 right-0 w-5 h-5 bg-transparent">
        <div className="w-5 h-5 bg-white rounded-bl-full"></div>
      </div>
      
      {/* Black fill that grows from left to right */}
      <div 
        className="absolute inset-0 bg-black overflow-hidden"
        style={{
          borderRadius: '0 0 20px 20px',
          width: `${fillProgress}%`,
        }}
      />
      
      {/* Black fill top corners */}
      {fillProgress > 0 && (
        <div className="absolute top-0 left-0 w-5 h-5 bg-transparent">
          <div className="w-5 h-5 bg-black rounded-br-full"></div>
        </div>
      )}
      {fillProgress > 95 && (
        <div className="absolute top-0 right-0 w-5 h-5 bg-transparent">
          <div className="w-5 h-5 bg-black rounded-bl-full"></div>
        </div>
      )}
      
      {/* White text (shows on white background) */}
      <h1 
        className={`${sizeClasses[size]} font-semibold relative z-20 px-4 py-1 text-white`}
      >
        {children}
      </h1>
      
      {/* Black text that reveals as black fills */}
      <div 
        className="absolute top-0 left-0 overflow-hidden"
        style={{
          width: `${fillProgress}%`,
        }}
      >
        <h1 
          className={`${sizeClasses[size]} font-semibold px-4 py-1 text-black whitespace-nowrap`}
        >
          {children}
        </h1>
      </div>
    </div>
    </div>
  );
};

export default AnimatedHeader;