import { useRef, useEffect, useState, useMemo, useId, FC, PointerEvent } from 'react';

interface CurvedLoopProps {
  marqueeText?: string;
  speed?: number;
  className?: string;
  curveAmount?: number;
  direction?: 'left' | 'right';
  interactive?: boolean;
}

const CurvedLoop: FC<CurvedLoopProps> = ({
  marqueeText = '',
  speed = 1,
  className,
  curveAmount = 50,
  direction = 'left',
  interactive = true
}) => {
  const pathRef = useRef<SVGPathElement | null>(null);
  const textPathRef = useRef<SVGTextPathElement | null>(null);
  const measureRef = useRef<SVGTextElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [textWidth, setTextWidth] = useState(0);
  const [pathLength, setPathLength] = useState(0);
  const [offset, setOffset] = useState(0);

  const dragRef = useRef(false);
  const lastXRef = useRef(0);
  const velRef = useRef(0);
  const dirRef = useRef<'left' | 'right'>(direction);

  const uid = useId();
  const pathId = `curve-${uid}`;

  // 1. Define the Curve
  // We intentionally make the path wider than the viewbox (M-200 to 1640)
  // to ensure there are no empty gaps on the edges of the screen.
  const pathD = `M-200,60 Q720,${60 + curveAmount} 1640,60`;

  // 2. Clean the text
  const cleanText = useMemo(() => {
    const hasTrailing = /\s|\u00A0$/.test(marqueeText);
    return (hasTrailing ? marqueeText.replace(/\s+$/, '') : marqueeText) + '\u00A0';
  }, [marqueeText]);

  // 3. Measure Text & Path
  useEffect(() => {
    // Measure Text
    if (measureRef.current) {
      setTextWidth(measureRef.current.getComputedTextLength());
    }
    // Measure Path
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, [cleanText, curveAmount]);

  // 4. Generate the Infinite String
  const { fullText, repeatCount } = useMemo(() => {
    if (!textWidth || !pathLength) return { fullText: '', repeatCount: 0 };

    // How many times does the text fit on the path?
    const itemsPerPath = Math.ceil(pathLength / textWidth);

    // We need enough text to cover the path TWICE + buffer to loop safely
    // This prevents it from "running out" on the right side
    const safeRepeats = itemsPerPath * 2 + 4;

    const str = new Array(safeRepeats).fill(cleanText).join('');
    return { fullText: str, repeatCount: safeRepeats };
  }, [textWidth, pathLength, cleanText]);

  // 5. Animation Loop
  useEffect(() => {
    if (!textWidth || !pathLength) return;

    let animationFrameId: number;

    const animate = () => {
      if (!dragRef.current && textPathRef.current) {
        // Calculate movement
        const delta = dirRef.current === 'right' ? speed : -speed;

        // Use a ref-based approach for smoother animation state if needed,
        // but setState is fine here for the loop logic.
        setOffset(prev => {
          let next = prev + delta;

          // LOOP LOGIC:
          // If we moved left by one whole text item width, snap back to 0
          if (next <= -textWidth) {
            next += textWidth;
          }
          // If we moved right past 0, snap back to -textWidth
          if (next > 0) {
            next -= textWidth;
          }
          return next;
        });
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [textWidth, pathLength, speed]);

  // 6. Drag Handlers
  const onPointerDown = (e: PointerEvent) => {
    if (!interactive) return;
    dragRef.current = true;
    lastXRef.current = e.clientX;
    velRef.current = 0;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!interactive || !dragRef.current) return;
    const dx = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    velRef.current = dx;

    setOffset(prev => {
      let next = prev + dx;
      // Same loop logic for drag
      if (next <= -textWidth) next += textWidth;
      if (next > 0) next -= textWidth;
      return next;
    });
  };

  const onPointerUp = () => {
    if (!interactive) return;
    dragRef.current = false;
    // Preserve inertia direction
    if (velRef.current !== 0) {
      dirRef.current = velRef.current > 0 ? 'right' : 'left';
    }
  };

  // Helper: Only show content when calculations are done
  const isReady = textWidth > 0 && pathLength > 0 && repeatCount > 0;

  return (
    <div
      ref={containerRef}
      className="w-full h-auto select-none overflow-hidden"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      style={{ cursor: interactive ? (dragRef.current ? 'grabbing' : 'grab') : 'auto' }}
    >
      <svg
        className="w-full block h-[160px] overflow-visible" // Fixed height prevents layout jumps
        viewBox="0 0 1440 160"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <path id={pathId} d={pathD} ref={pathRef} fill="none" />
        </defs>

        {/* Hidden text for measurement */}
        <text ref={measureRef} className={className} style={{ opacity: 0 }}>
          {cleanText}
        </text>

        {isReady && (
          <text
            className={className}
            dy={10} // Fine tune vertical centering
            fill="currentColor"
          >
            <textPath
              ref={textPathRef}
              href={`#${pathId}`}
              startOffset={offset}
              spacing="auto"
              method="align" // 'align' usually renders more consistently on curves than 'stretch'
            >
              {fullText}
            </textPath>
          </text>
        )}
      </svg>
    </div>
  );
};

export default CurvedLoop;