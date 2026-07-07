import { useRef, useEffect, useState } from 'react';

interface UseScrollTiltOptions {
  /** Maximum rotation in degrees (default: 5) */
  maxRotation?: number;
  /** Threshold for when rotation starts (0-1, default: 0.2) */
  threshold?: number;
}

export function useScrollTilt(options: UseScrollTiltOptions = {}) {
  const { maxRotation = 5, threshold = 0.2 } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let rafId: number;

    const calculateRotation = () => {
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Calculate how much of the element is visible in the viewport
      const elementTop = rect.top;
      const elementBottom = rect.bottom;
      
      // Check if element is in viewport
      const isInView = elementBottom > 0 && elementTop < viewportHeight;
      
      if (isInView) {
        // Calculate visibility progress (0 to 1)
        // Start rotating when the element enters the viewport
        const visibleHeight = Math.min(elementBottom, viewportHeight) - Math.max(elementTop, 0);
        const visibilityRatio = visibleHeight / Math.min(elementBottom - elementTop, viewportHeight);
        
        // Calculate rotation based on scroll position
        // More rotation when element is closer to center of viewport
        const elementCenter = elementTop + (elementBottom - elementTop) / 2;
        const viewportCenter = viewportHeight / 2;
        const distanceFromCenter = Math.abs(elementCenter - viewportCenter) / (viewportHeight / 2);
        
        // Rotate more when closer to center, less when at edges
        const centerProximity = 1 - distanceFromCenter;
        const adjustedVisibility = Math.max(0, visibilityRatio - threshold) / (1 - threshold);
        const finalRotation = Math.min(maxRotation, adjustedVisibility * centerProximity * maxRotation);
        
        setRotation(finalRotation);
        setIsVisible(true);
      } else {
        // Smoothly return to 0 when not in view
        setRotation(0);
        setIsVisible(false);
      }
      
      rafId = requestAnimationFrame(calculateRotation);
    };

    // Initial calculation
    calculateRotation();

    // Attach scroll listener
    window.addEventListener('scroll', calculateRotation, { passive: true });
    window.addEventListener('resize', calculateRotation, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', calculateRotation);
      window.removeEventListener('resize', calculateRotation);
    };
  }, [maxRotation, threshold]);

  return { ref, rotation, isVisible };
}