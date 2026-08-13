'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, HelpCircle, ArrowRight } from 'lucide-react';

interface TutorialOverlayProps {
  stepId: string;
  title: string;
  content: string;
  stepNumber: number;
  totalSteps: number;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  highlightSelector?: string;
  learnMoreSection?: string;
  onDismiss: () => void;
  onSkipAll: () => void;
  onNeverShow?: () => void;
  onLearnMore?: (section: string) => void;
}

const TOOLTIP_GAP = 12;

export function TutorialOverlay({
  stepId,
  title,
  content,
  stepNumber,
  totalSteps,
  position = 'bottom',
  highlightSelector,
  learnMoreSection,
  onDismiss,
  onSkipAll,
  onNeverShow,
  onLearnMore,
}: TutorialOverlayProps) {
  const [visible, setVisible] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const computePosition = useCallback(() => {
    // If no selector or position is center, center the tooltip on screen
    if (!highlightSelector || position === 'center') {
      setHighlightStyle(null);
      setTooltipStyle({
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      });
      return;
    }

    const target = document.querySelector(highlightSelector);
    if (!target) {
      // Element not found -- fall back to center
      setHighlightStyle(null);
      setTooltipStyle({
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      });
      return;
    }

    const rect = target.getBoundingClientRect();

    // Highlight ring over the target element (dimming is the full-screen blocker)
    setHighlightStyle({
      position: 'fixed',
      top: rect.top - 4,
      left: rect.left - 4,
      width: rect.width + 8,
      height: rect.height + 8,
      borderRadius: 8,
      zIndex: 41,
      pointerEvents: 'none',
    });

    const tooltipEl = tooltipRef.current;
    const tooltipWidth = tooltipEl?.offsetWidth ?? 384;
    const tooltipHeight = tooltipEl?.offsetHeight ?? 200;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = rect.top - tooltipHeight - TOOLTIP_GAP;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'bottom':
        top = rect.bottom + TOOLTIP_GAP;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - TOOLTIP_GAP;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + TOOLTIP_GAP;
        break;
    }

    // Clamp so the tooltip stays within the viewport
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    top = Math.max(8, Math.min(top, vh - tooltipHeight - 8));
    left = Math.max(8, Math.min(left, vw - tooltipWidth - 8));

    setTooltipStyle({
      position: 'fixed',
      top,
      left,
    });
  }, [highlightSelector, position]);

  // Fade in on mount & compute position
  useEffect(() => {
    // Trigger the fade-in on next frame so the transition plays
    const raf = requestAnimationFrame(() => {
      setVisible(true);
    });
    computePosition();
    return () => cancelAnimationFrame(raf);
  }, [computePosition]);

  // Recompute on resize / scroll
  useEffect(() => {
    const handleLayout = () => computePosition();
    window.addEventListener('resize', handleLayout);
    window.addEventListener('scroll', handleLayout, true);
    return () => {
      window.removeEventListener('resize', handleLayout);
      window.removeEventListener('scroll', handleLayout, true);
    };
  }, [computePosition]);

  // Re-measure once the tooltip has rendered so we get accurate dimensions
  useEffect(() => {
    if (visible) {
      computePosition();
    }
  }, [visible, computePosition]);

  return (
    <>
      {/* Full-screen blocker — must acknowledge tip before continuing play */}
      <div
        className="fixed inset-0 z-40 bg-black/45 transition-opacity duration-300"
        style={{
          pointerEvents: 'auto',
          opacity: visible ? 1 : 0,
        }}
        aria-hidden
      />

      {/* Highlight ring (visual only; play is still blocked until Got it) */}
      {highlightStyle && (
        <div
          className="transition-opacity duration-300 ring-2 ring-primary"
          style={{
            ...highlightStyle,
            boxShadow: 'none',
            background: 'transparent',
            opacity: visible ? 1 : 0,
          }}
        />
      )}

      {/* Tooltip card */}
      <Card
        ref={tooltipRef}
        className="bg-card border-primary/30 shadow-xl max-w-md z-50 transition-all duration-300"
        style={{
          ...tooltipStyle,
          pointerEvents: 'auto',
          opacity: visible ? 1 : 0,
          ...(visible
            ? { transform: tooltipStyle.transform ?? 'translateY(0)' }
            : {
                transform: tooltipStyle.transform
                  ? tooltipStyle.transform
                  : 'translateY(8px)',
              }),
        }}
      >
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
          <HelpCircle className="h-5 w-5 text-primary shrink-0" />
          <span className="text-base font-semibold leading-tight flex-1">
            {title}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={onDismiss}
            aria-label="Close tutorial step"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="pb-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {content}
          </p>
        </CardContent>

        <CardFooter className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">
            {stepNumber} of {totalSteps}
          </span>

          <div className="flex items-center gap-2">
            {learnMoreSection && onLearnMore && (
              <Button
                variant="link"
                size="sm"
                className="text-xs px-1"
                onClick={() => onLearnMore(learnMoreSection)}
              >
                Learn more <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            )}
            <Button size="sm" onClick={onDismiss}>
              Got it
            </Button>
            <Button variant="ghost" size="sm" onClick={onSkipAll}>
              Skip
            </Button>
            {onNeverShow && (
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={onNeverShow}>
                Never show
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
