import React, { useState, useEffect, useRef } from 'react';
import { EmotionType } from '../types';

interface MiroCompanionProps {
  status?: EmotionType;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  interactive?: boolean;
  onClick?: () => void;
  caption?: string;
  className?: string;
}

export const MiroCompanion: React.FC<MiroCompanionProps> = ({
  status = 'idle',
  size = 'md',
  interactive = true,
  onClick,
  caption,
  className = '',
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [localBounce, setLocalBounce] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Natural blinking cycle
  useEffect(() => {
    let blinkTimer: NodeJS.Timeout;
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => {
        setIsBlinking(false);
        const nextBlink = Math.random() * 3200 + 2000;
        blinkTimer = setTimeout(triggerBlink, nextBlink);
      }, 160);
    };

    blinkTimer = setTimeout(triggerBlink, 2500);
    return () => clearTimeout(blinkTimer);
  }, []);

  // Eye tracking mouse movement
  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const dist = Math.hypot(deltaX, deltaY);

      // Max eye offset limit in SVG units
      const maxOffset = 5;
      if (dist === 0) {
        setPupilOffset({ x: 0, y: 0 });
      } else {
        const factor = Math.min(dist / 350, 1);
        setPupilOffset({
          x: (deltaX / dist) * maxOffset * factor,
          y: (deltaY / dist) * maxOffset * factor,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [interactive]);

  const handleMiroClick = () => {
    setLocalBounce(true);
    setTimeout(() => setLocalBounce(false), 600);
    onClick?.();
  };

  // Dimensions based on size prop
  const sizeMap = {
    sm: { width: 80, height: 80, viewSize: 100 },
    md: { width: 140, height: 140, viewSize: 160 },
    lg: { width: 220, height: 220, viewSize: 220 },
    hero: { width: 280, height: 280, viewSize: 280 },
  };

  const currentSize = sizeMap[size];

  // Eye calculation logic based on status
  const isHappy = status === 'happy' || isHovered;
  const isThinking = status === 'thinking';
  const isListening = status === 'listening';
  const isSpeaking = status === 'speaking';
  const isConcerned = status === 'concerned';
  const isPlayful = status === 'playful';

  // Eye pupils offset adjustment
  let eyeTargetX = pupilOffset.x;
  let eyeTargetY = pupilOffset.y;

  if (isThinking) {
    eyeTargetX = 3.5;
    eyeTargetY = -4.5;
  } else if (isListening) {
    eyeTargetX = 0;
    eyeTargetY = 1.2;
  }

  return (
    <div
      ref={containerRef}
      onClick={handleMiroClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative inline-flex flex-col items-center justify-center select-none ${
        interactive ? 'cursor-pointer' : ''
      } ${className}`}
      style={{ width: currentSize.width, height: currentSize.height }}
      role="img"
      aria-label={`Miro AI companion in ${status} expression`}
    >
      {/* Listening / Thinking Ambient Soundwave Aura */}
      {isListening && (
        <div className="absolute inset-0 rounded-full border border-stone-300 dark:border-stone-600 animate-miro-pulse pointer-events-none" />
      )}
      {isThinking && (
        <div className="absolute inset-0 rounded-full bg-stone-200/40 dark:bg-stone-800/40 blur-xl animate-pulse pointer-events-none" />
      )}

      {/* Main SVG Character */}
      <svg
        viewBox="0 0 200 200"
        className={`w-full h-full drop-shadow-sm transition-transform duration-300 ${
          status === 'idle' ? 'animate-miro-float' : ''
        } ${localBounce ? 'scale-110 -translate-y-2' : ''}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Porcelain body smooth gradient */}
          <linearGradient id="miroBodyGrad" x1="100" y1="35" x2="100" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="70%" stopColor="#F7F6F2" />
            <stop offset="100%" stopColor="#EFECE6" />
          </linearGradient>

          {/* Soft inner glow/ambient occlusion shadow */}
          <radialGradient id="miroInnerGlow" cx="50%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="85%" stopColor="#E6E2D8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#D8D2C4" stopOpacity="0.7" />
          </radialGradient>

          {/* Cheeks blush gradient */}
          <radialGradient id="miroBlush" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FCA5A5" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#FCA5A5" stopOpacity="0" />
          </radialGradient>

          {/* Antenna Orb Gradient */}
          <radialGradient id="antennaGlow" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="70%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </radialGradient>
        </defs>

        {/* Soft ground shadow */}
        <ellipse cx="100" cy="186" rx="48" ry="8" fill="rgba(28, 25, 23, 0.08)" />

        {/* Floating Top Antenna / Little Halo Sparkle */}
        <g className="transition-transform duration-500 origin-bottom" style={{ transform: isListening ? 'scale(1.15) translateY(-2px)' : 'scale(1)' }}>
          {/* Stem */}
          <path
            d="M100 48 Q 100 36 100 28"
            stroke="#44403C"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Glowing Orb */}
          <circle cx="100" cy="24" r="7.5" fill="url(#antennaGlow)" />
          <circle cx="98" cy="22" r="2.5" fill="#FFFFFF" opacity="0.9" />
          {/* Sparkle ring when thinking or listening */}
          {(isThinking || isListening) && (
            <circle cx="100" cy="24" r="11" stroke="#FBBF24" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.75" />
          )}
        </g>

        {/* Miro's Cute Rounded Organic Body */}
        <g className="animate-miro-breathe origin-center">
          <path
            d="M 100 44
               C 152 44, 168 85, 168 126
               C 168 162, 142 178, 100 178
               C 58 178, 32 162, 32 126
               C 32 85, 48 44, 100 44 Z"
            fill="url(#miroBodyGrad)"
            stroke="#292524"
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* Soft 3D lighting overlay */}
          <path
            d="M 100 44
               C 152 44, 168 85, 168 126
               C 168 162, 142 178, 100 178
               C 58 178, 32 162, 32 126
               C 32 85, 48 44, 100 44 Z"
            fill="url(#miroInnerGlow)"
            opacity="0.6"
          />

          {/* Rosy Cheeks */}
          <ellipse cx="62" cy="122" rx="11" ry="6.5" fill="url(#miroBlush)" />
          <ellipse cx="138" cy="122" rx="11" ry="6.5" fill="url(#miroBlush)" />

          {/* LEFT EYE */}
          <g transform={`translate(${68 + eyeTargetX}, ${104 + eyeTargetY})`}>
            {isHappy ? (
              // Happy Crescent Arc Eye
              <path
                d="M -12 2 Q 0 -9 12 2"
                stroke="#1C1917"
                strokeWidth="4.2"
                strokeLinecap="round"
                fill="none"
              />
            ) : isBlinking ? (
              // Blink Line
              <line x1="-10" y1="0" x2="10" y2="0" stroke="#1C1917" strokeWidth="3.5" strokeLinecap="round" />
            ) : (
              // Big Cartoon Eye with Reflections
              <g>
                {/* White Sclera with outline */}
                <ellipse cx="0" cy="0" rx="11.5" ry="14" fill="#1C1917" />
                {/* Large Glossy Catchlight reflection */}
                <circle cx="-3" cy="-4" r="4.2" fill="#FFFFFF" />
                {/* Secondary Star Catchlight */}
                <circle cx="4" cy="5" r="2.2" fill="#FFFFFF" opacity="0.85" />
              </g>
            )}
          </g>

          {/* RIGHT EYE */}
          <g transform={`translate(${132 + eyeTargetX}, ${104 + eyeTargetY})`}>
            {isHappy ? (
              // Happy Crescent Arc Eye
              <path
                d="M -12 2 Q 0 -9 12 2"
                stroke="#1C1917"
                strokeWidth="4.2"
                strokeLinecap="round"
                fill="none"
              />
            ) : isPlayful ? (
              // Playful Wink on right eye!
              <path
                d="M -10 0 Q 0 -6 10 0"
                stroke="#1C1917"
                strokeWidth="3.8"
                strokeLinecap="round"
                fill="none"
              />
            ) : isBlinking ? (
              // Blink Line
              <line x1="-10" y1="0" x2="10" y2="0" stroke="#1C1917" strokeWidth="3.5" strokeLinecap="round" />
            ) : (
              // Big Cartoon Eye with Reflections
              <g>
                <ellipse cx="0" cy="0" rx="11.5" ry="14" fill="#1C1917" />
                <circle cx="-3" cy="-4" r="4.2" fill="#FFFFFF" />
                <circle cx="4" cy="5" r="2.2" fill="#FFFFFF" opacity="0.85" />
              </g>
            )}
          </g>

          {/* MOUTH */}
          <g transform="translate(100, 126)">
            {isSpeaking ? (
              // Speaking animated mouth
              <ellipse
                cx="0"
                cy="0"
                rx="6.5"
                ry="7.5"
                fill="#1C1917"
                className="animate-mouth-speak"
              />
            ) : isHappy ? (
              // Cheerful open smile
              <path
                d="M -8 -1 Q 0 9 8 -1"
                stroke="#1C1917"
                strokeWidth="3.2"
                strokeLinecap="round"
                fill="#F87171"
              />
            ) : isConcerned ? (
              // Soft compassionate little curve
              <path
                d="M -5 2 Q 0 -2 5 2"
                stroke="#1C1917"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
              />
            ) : isThinking ? (
              // Little thinking pursed dot mouth
              <circle cx="0" cy="0" r="2.8" fill="#1C1917" />
            ) : (
              // Standard warm little smile
              <path
                d="M -6 -1 Q 0 5 6 -1"
                stroke="#1C1917"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
              />
            )}
          </g>
        </g>
      </svg>

      {/* Optional Status Caption or Thought Tag */}
      {caption && (
        <span className="mt-2 text-xs font-medium text-stone-500 dark:text-stone-400 select-none tracking-wide">
          {caption}
        </span>
      )}
    </div>
  );
};
