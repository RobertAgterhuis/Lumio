"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TransitionProps {
  /** Whether the content should be visible */
  show: boolean;
  /** Content to animate */
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
  /** Duration of the animation in ms (default: 200) */
  duration?: number;
  /** If true, don't unmount when hidden (useful for preserving state) */
  keepMounted?: boolean;
}

/**
 * FadeIn - Simple opacity transition
 * Fades content in/out when show prop changes
 */
export function FadeIn({
  show,
  children,
  className,
  duration = 200,
  keepMounted = false,
}: TransitionProps) {
  const [mounted, setMounted] = React.useState(false);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (show) {
      setMounted(true);
      requestAnimationFrame(() => setVisible(true));
    } else if (mounted) {
      setVisible(false);
      if (!keepMounted) {
        const timer = setTimeout(() => setMounted(false), duration);
        return () => clearTimeout(timer);
      }
    }
  }, [show, mounted, duration, keepMounted]);

  if (!mounted && !keepMounted) return null;

  return (
    <div
      className={cn(
        "transition-opacity",
        visible ? "opacity-100" : "opacity-0",
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

type SlideDirection = "up" | "down" | "left" | "right";

interface SlideInProps extends TransitionProps {
  /** Direction to slide from (default: "up") */
  from?: SlideDirection;
  /** Distance to slide in pixels (default: 16) */
  distance?: number;
}

const slideTransforms: Record<SlideDirection, (distance: number) => string> = {
  up: (d) => `translateY(${d}px)`,
  down: (d) => `translateY(-${d}px)`,
  left: (d) => `translateX(${d}px)`,
  right: (d) => `translateX(-${d}px)`,
};

/**
 * SlideIn - Slide + fade transition
 * Slides and fades content in/out when show prop changes
 */
export function SlideIn({
  show,
  children,
  className,
  duration = 200,
  keepMounted = false,
  from = "up",
  distance = 16,
}: SlideInProps) {
  const [mounted, setMounted] = React.useState(false);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (show) {
      setMounted(true);
      requestAnimationFrame(() => setVisible(true));
    } else if (mounted) {
      setVisible(false);
      if (!keepMounted) {
        const timer = setTimeout(() => setMounted(false), duration);
        return () => clearTimeout(timer);
      }
    }
  }, [show, mounted, duration, keepMounted]);

  if (!mounted && !keepMounted) return null;

  const transform = visible ? "translate(0)" : slideTransforms[from](distance);

  return (
    <div
      className={cn(
        "transition-all",
        visible ? "opacity-100" : "opacity-0",
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: "ease-out",
        transform,
      }}
    >
      {children}
    </div>
  );
}

interface ScaleInProps extends TransitionProps {
  /** Initial scale (default: 0.95) */
  initialScale?: number;
}

/**
 * ScaleIn - Scale + fade transition
 * Scales and fades content in/out when show prop changes
 */
export function ScaleIn({
  show,
  children,
  className,
  duration = 200,
  keepMounted = false,
  initialScale = 0.95,
}: ScaleInProps) {
  const [mounted, setMounted] = React.useState(false);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (show) {
      setMounted(true);
      requestAnimationFrame(() => setVisible(true));
    } else if (mounted) {
      setVisible(false);
      if (!keepMounted) {
        const timer = setTimeout(() => setMounted(false), duration);
        return () => clearTimeout(timer);
      }
    }
  }, [show, mounted, duration, keepMounted]);

  if (!mounted && !keepMounted) return null;

  return (
    <div
      className={cn(
        "transition-all",
        visible ? "opacity-100" : "opacity-0",
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: "ease-out",
        transform: visible ? "scale(1)" : `scale(${initialScale})`,
      }}
    >
      {children}
    </div>
  );
}

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  /** Delay before starting the animation in ms (default: 0) */
  delay?: number;
}

/**
 * PageTransition — wraps page content in a subtle slide-up + fade entrance animation.
 * Automatically plays on mount. Uses a stagger-friendly `delay` prop for child sections.
 */
export function PageTransition({ children, className, delay = 0 }: PageTransitionProps) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      requestAnimationFrame(() => setVisible(true));
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        "transition-all duration-300 ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
        className
      )}
    >
      {children}
    </div>
  );
}
