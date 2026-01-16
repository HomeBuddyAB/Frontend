import React, { useRef } from 'react';

interface GlareHoverProps {
  width?: string;
  height?: string;
  background?: string;
  borderRadius?: string;
  borderColor?: string;
  children?: React.ReactNode;
  glareColor?: string;
  glareOpacity?: number;
  glareAngle?: number;
  glareSize?: number;
  transitionDuration?: number;
  playOnce?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const GlareHover: React.FC<GlareHoverProps> = ({
  width = '500px',
  height = '500px',
  background = '#000',
  borderRadius = '10px',
  borderColor = '#333',
  children,
  glareColor = '#ffffff',
  glareOpacity = 0.5,
  glareAngle = -45,
  glareSize = 250,
  transitionDuration = 650,
  playOnce = false,
  className = '',
  style = {}
}) => {
  const hex = glareColor.replace('#', '');
  let rgba = glareColor;

  if (/^[\dA-Fa-f]{6}$/.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
  } else if (/^[\dA-Fa-f]{3}$/.test(hex)) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
  }

  const containerRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const isAnimatingRef = useRef(false);

  const animateIn = () => {
    const el = overlayRef.current;
    if (!el || isAnimatingRef.current) return;

    isAnimatingRef.current = true;
    el.style.transition = 'none';
    el.style.backgroundPosition = '-150% -150%';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = `background-position ${transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        el.style.backgroundPosition = '150% 150%';

        setTimeout(() => {
          isAnimatingRef.current = false;
        }, transitionDuration);
      });
    });
  };

  const animateOut = () => {
    const el = overlayRef.current;
    if (!el || isAnimatingRef.current) return;

    if (playOnce) {
      el.style.transition = 'none';
      el.style.backgroundPosition = '-150% -150%';
    } else {
      isAnimatingRef.current = true;
      el.style.transition = `background-position ${transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
      el.style.backgroundPosition = '-150% -150%';

      setTimeout(() => {
        isAnimatingRef.current = false;
      }, transitionDuration);
    }
  };

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: `linear-gradient(${glareAngle}deg,
        transparent 40%,
        ${rgba} 50%,
        transparent 60%)`,
    backgroundSize: `300% 300%`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: '-150% -150%',
    pointerEvents: 'none',
    zIndex: 5
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden border cursor-pointer ${className}`}
      style={{
        width,
        height,
        background,
        borderRadius,
        borderColor,
        ...style
      }}
      onMouseEnter={animateIn}
      onMouseLeave={animateOut}
    >
      <div ref={overlayRef} style={overlayStyle} />
      {children}
    </div>
  );
};

export default GlareHover;