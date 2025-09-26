'use client';

import { useState, useEffect } from 'react';

// Breakpoints matching Tailwind's default breakpoints
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

type BreakpointKey = keyof typeof breakpoints;

/**
 * Hook to check if the current viewport is at least a certain breakpoint
 * @param breakpoint The breakpoint to check (sm, md, lg, xl, 2xl)
 * @returns Boolean indicating if the viewport is at least the specified breakpoint
 */
export function useBreakpoint(breakpoint: BreakpointKey): boolean {
  const [isAboveBreakpoint, setIsAboveBreakpoint] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const checkBreakpoint = () => {
      setIsAboveBreakpoint(window.innerWidth >= breakpoints[breakpoint]);
    };

    // Initial check
    checkBreakpoint();

    // Add event listener for window resize
    window.addEventListener('resize', checkBreakpoint);

    // Clean up
    return () => window.removeEventListener('resize', checkBreakpoint);
  }, [breakpoint]);

  // Return false during SSR to avoid hydration mismatch
  return mounted ? isAboveBreakpoint : false;
}

/**
 * Hook to get the current breakpoint
 * @returns The current breakpoint (sm, md, lg, xl, 2xl)
 */
export function useCurrentBreakpoint(): BreakpointKey | null {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<BreakpointKey | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const checkBreakpoint = () => {
      const width = window.innerWidth;
      
      if (width >= breakpoints['2xl']) {
        setCurrentBreakpoint('2xl');
      } else if (width >= breakpoints.xl) {
        setCurrentBreakpoint('xl');
      } else if (width >= breakpoints.lg) {
        setCurrentBreakpoint('lg');
      } else if (width >= breakpoints.md) {
        setCurrentBreakpoint('md');
      } else if (width >= breakpoints.sm) {
        setCurrentBreakpoint('sm');
      } else {
        setCurrentBreakpoint(null); // Below smallest breakpoint
      }
    };

    // Initial check
    checkBreakpoint();

    // Add event listener for window resize
    window.addEventListener('resize', checkBreakpoint);

    // Clean up
    return () => window.removeEventListener('resize', checkBreakpoint);
  }, []);

  // Return null during SSR to avoid hydration mismatch
  return mounted ? currentBreakpoint : null;
}

/**
 * Component that renders different content based on the current breakpoint
 */
interface ResponsiveProps {
  breakpoint: BreakpointKey;
  above: React.ReactNode;
  below: React.ReactNode;
}

export function Responsive({ breakpoint, above, below }: ResponsiveProps) {
  const isAbove = useBreakpoint(breakpoint);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Return null during SSR to avoid hydration mismatch
  if (!mounted) return null;

  return <>{isAbove ? above : below}</>;
}

/**
 * Component that only renders on mobile devices (below md breakpoint)
 */
export function MobileOnly({ children }: { children: React.ReactNode }) {
  const isMobile = !useBreakpoint('md');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Return null during SSR to avoid hydration mismatch
  if (!mounted) return null;

  return isMobile ? <>{children}</> : null;
}

/**
 * Component that only renders on desktop devices (md breakpoint and above)
 */
export function DesktopOnly({ children }: { children: React.ReactNode }) {
  const isDesktop = useBreakpoint('md');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Return null during SSR to avoid hydration mismatch
  if (!mounted) return null;

  return isDesktop ? <>{children}</> : null;
}