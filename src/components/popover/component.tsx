import * as React from 'react';
import { PopoverSide } from '../../hooks/use-anchor';
import { PopoverBox } from '../stack/styles';

interface PopoverProps {
  side: PopoverSide;
  label: string;
  children: React.ReactNode;
}

const MARGIN = 8;

/**
 * Opens next to the item that owns it and then nudges itself back inside the
 * window, so it is never cut off wherever the stack is docked.
 */
export function Popover({ side, label, children }: PopoverProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.style.translate = '';
    const rect = element.getBoundingClientRect();
    let dx = 0;
    let dy = 0;
    if (rect.right > window.innerWidth - MARGIN) dx = window.innerWidth - MARGIN - rect.right;
    if (rect.left + dx < MARGIN) dx = MARGIN - rect.left;
    if (rect.bottom > window.innerHeight - MARGIN) dy = window.innerHeight - MARGIN - rect.bottom;
    if (rect.top + dy < MARGIN) dy = MARGIN - rect.top;
    if (dx || dy) element.style.translate = `${dx}px ${dy}px`;
  });

  return (
    <PopoverBox
      ref={ref}
      className="bbb-participant-stack__popover"
      role="dialog"
      aria-label={label}
      $side={side}
      // Clicks inside must not reach the draggable floating window
      onMouseDown={(event) => event.stopPropagation()}
      onTouchStart={(event) => event.stopPropagation()}
    >
      {children}
    </PopoverBox>
  );
}
