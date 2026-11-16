import * as React from 'react';
import { Position } from '../commons/settings';

export type PopoverSide = 'below' | 'above' | 'beside';

export const TITLE_SELECTOR = '#Navbar #presentationTitle, #Navbar [data-test="presentationTitle"]';

export interface Anchor {
  // The position in effect: it changes while a sidebar panel is open, if so configured
  position: Position;
  // Inline style of the fixed-position stack; null until the client layout exists
  style: React.CSSProperties | null;
  // Room for the stack along its main axis, in px
  available: number;
  // Room once the pointer is on the stack: in the top bar it may then spread over
  // the meeting title, up to the client's buttons at the end of the bar
  availableExpanded?: number;
  // Avatar size in px, when the default would not fit where the stack is docked
  size?: number;
  vertical: boolean;
  popoverSide: PopoverSide;
  // Selector of the client bar the stack is docked in, when it is in one
  bar?: string;
  // navbar-center only: where the meeting title, displaced by the stack, is redrawn
  titleStyle?: React.CSSProperties;
}

const GAP = 12;
// Room kept at the start of the nav bar for the displaced meeting title
const TITLE_ROOM = 168;
// A bar with less free room than this (a phone, mostly) cannot hold the stack,
// which then goes right below the nav bar, over the content
const MIN_ROOM = 150;

const rectOf = (selector: string): DOMRect | null => (
  document.querySelector(selector)?.getBoundingClientRect() ?? null
);

const TALKING_INDICATOR = '[data-test="talkingIndicator"]';

export const defaultSize = () => {
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  return (window.innerWidth <= 640 ? 2 : 2.5) * rem;
};

/**
 * The client shows who is talking right below the first row of the nav bar, and
 * the two must not overlap. The stack moves up as far as the bar allows and
 * only then shrinks its avatars.
 */
const clearOfTalkingIndicator = (
  center: number,
  navbar: DOMRect,
): { center: number; size?: number } => {
  const talking = rectOf(TALKING_INDICATOR);
  if (!talking || talking.top <= center) return { center };
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  // Padding and border of the pill around the avatars
  const chrome = 0.6 * rem + 2;
  const top = navbar.top + 2;
  const bottom = talking.top - 2;
  const size = Math.max(1.5 * rem, Math.min(defaultSize(), bottom - top - chrome));
  const half = (size + chrome) / 2;
  return {
    center: Math.max(top + half, Math.min(center, bottom - half)),
    size: size < defaultSize() ? size : undefined,
  };
};

// The client's own controls in the first row of the nav bar: what the stack must
// make room for. Not the (possibly hidden) title, and not the talking indicator,
// whose buttons come and go in the row below and must not push the stack around.
const barButtons = (): DOMRect[] => {
  const title = rectOf(TITLE_SELECTOR);
  return Array
    .from(document.querySelectorAll('#Navbar button, #Navbar [role="button"]'))
    .filter((element) => !element.matches(TITLE_SELECTOR) && !element.querySelector(TITLE_SELECTOR)
      && !element.closest('#presentationTitle') && !element.closest(TALKING_INDICATOR))
    .map((element) => element.getBoundingClientRect())
    .filter((rect) => rect.width > 0)
    .filter((rect) => !title || (rect.top < title.bottom && rect.bottom > title.top));
};

/**
 * The SDK cannot dock content in the client layout yet, so the stack lives in a
 * floating window and docks itself: it follows the client's own nav bar and
 * actions bar, which the client moves and resizes when panels open or close.
 */
const place = (position: Position): Omit<Anchor, 'position'> => {
  const navbar = rectOf('#Navbar');
  const actionsBar = rectOf('#ActionsBar');
  const rtl = document.documentElement.dir === 'rtl' || document.body.dir === 'rtl';
  const hidden: Omit<Anchor, 'position'> = {
    style: null, available: 0, vertical: false, popoverSide: 'below',
  };
  if (!navbar || navbar.width === 0) return hidden;

  // Distance from the start edge (left, or right in RTL) of the viewport
  const startOf = (rect: DOMRect) => (rtl ? window.innerWidth - rect.right : rect.left);
  const inlineStart = (px: number): React.CSSProperties => (rtl ? { right: px } : { left: px });

  switch (position) {
    case 'navbar-left': {
      // Vertically centered on the row of the meeting title, in the free space before it
      const title = rectOf('#Navbar [data-test="presentationTitle"]') ?? rectOf('#presentationTitle');
      const { center, size } = clearOfTalkingIndicator(
        title ? title.top + title.height / 2 : navbar.top + navbar.height / 2,
        navbar,
      );
      const titleStart = title ? startOf(title) : startOf(navbar) + navbar.width / 2;
      // On small screens the client keeps a button of its own at the start of the bar
      const start = Math.max(startOf(navbar), ...barButtons()
        .filter((rect) => startOf(rect) < titleStart)
        .map((rect) => startOf(rect) + rect.width));
      const available = titleStart - start - GAP * 2;
      if (available < MIN_ROOM) return place('media-top-left');
      const end = Math.min(startOf(navbar) + navbar.width, ...barButtons()
        .map((rect) => startOf(rect))
        .filter((buttonStart) => buttonStart > titleStart));
      return {
        style: { top: center, transform: 'translateY(-50%)', ...inlineStart(start + GAP) },
        available,
        availableExpanded: end - start - GAP * 2,
        size,
        vertical: false,
        popoverSide: 'below',
        bar: '#Navbar',
      };
    }
    case 'navbar-center': {
      // Takes the place of the meeting title, which stays in the page (hidden)
      // and so still tells where the middle of the bar's first row is
      const title = rectOf(TITLE_SELECTOR);
      if (!title) return place('navbar-left');
      const centerX = title.left + title.width / 2;
      const titleY = title.top + title.height / 2;
      const { center: centerY, size } = clearOfTalkingIndicator(titleY, navbar);
      // Whatever the client keeps at the end of the bar (recording, leave, options)
      const others = barButtons()
        .filter((rect) => (rtl ? rect.right < title.left : rect.left > title.right));
      const endRoom = others.length
        ? Math.min(...others.map((rect) => (rtl ? centerX - rect.right : rect.left - centerX)))
        : navbar.width / 2;
      const startRoom = (rtl ? navbar.right - centerX : centerX - navbar.left) - TITLE_ROOM;
      const available = 2 * (Math.min(startRoom, endRoom) - GAP);
      if (available < MIN_ROOM) return place('navbar-left');
      return {
        style: { top: centerY, left: centerX, transform: 'translate(-50%, -50%)' },
        available,
        vertical: false,
        popoverSide: 'below',
        bar: '#Navbar',
        size,
        titleStyle: {
          top: titleY,
          transform: 'translateY(-50%)',
          maxWidth: TITLE_ROOM - GAP,
          ...inlineStart(startOf(navbar) + GAP),
        },
      };
    }
    case 'media-top-left':
      return {
        style: { top: navbar.bottom + GAP, ...inlineStart(startOf(navbar) + GAP) },
        available: navbar.width - GAP * 2,
        vertical: false,
        popoverSide: 'below',
      };
    case 'media-top-center':
      return {
        style: {
          top: navbar.bottom + GAP,
          left: navbar.left + navbar.width / 2,
          transform: 'translateX(-50%)',
        },
        available: navbar.width - GAP * 2,
        vertical: false,
        popoverSide: 'below',
      };
    case 'media-left': {
      const bottom = actionsBar ? actionsBar.top : window.innerHeight;
      return {
        style: {
          top: (navbar.bottom + bottom) / 2,
          transform: 'translateY(-50%)',
          ...inlineStart(startOf(navbar) + GAP),
        },
        available: bottom - navbar.bottom - GAP * 2,
        vertical: true,
        popoverSide: 'beside',
      };
    }
    case 'actions-bar-left': {
      if (!actionsBar || actionsBar.width === 0) return hidden;
      // The first button of the actions bar marks where the free space ends
      const firstButton = rectOf('#ActionsBar button');
      const buttonStart = firstButton
        ? startOf(firstButton)
        : startOf(actionsBar) + actionsBar.width / 2;
      const available = buttonStart - startOf(actionsBar) - GAP * 2;
      if (available < MIN_ROOM) return place('media-top-left');
      return {
        style: {
          top: actionsBar.top + actionsBar.height / 2,
          transform: 'translateY(-50%)',
          ...inlineStart(startOf(actionsBar) + GAP),
        },
        available,
        vertical: false,
        popoverSide: 'above',
        bar: '#ActionsBar',
      };
    }
    default:
      return {
        style: {}, available: Math.min(window.innerWidth - GAP * 2, 420), vertical: false, popoverSide: 'below',
      };
  }
};

const compute = (position: Position): Anchor => ({ ...place(position), position });

// The client's sidebar panel (chat, notes, polls, ...), when one is open
const isPanelOpen = () => (rectOf('[data-test="sidebarContentMain"]')?.width ?? 0) > 0;

const same = (a: Anchor, b: Anchor) => JSON.stringify(a) === JSON.stringify(b);

export const useAnchor = (position: Position, positionWithPanelOpen?: Position): Anchor => {
  const current = () => compute(positionWithPanelOpen && isPanelOpen()
    ? positionWithPanelOpen
    : position);
  const [anchor, setAnchor] = React.useState<Anchor>(current);

  React.useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = current();
        setAnchor((prev) => (same(prev, next) ? prev : next));
      });
    };
    update();

    const resizeObserver = new ResizeObserver(update);
    // The client positions its blocks with inline styles; a block that only
    // moves does not resize, hence the attribute observer.
    const mutationObserver = new MutationObserver(update);
    const observed = new Set<Element>();
    const observe = () => {
      ['#Navbar', '#ActionsBar', '#layout'].forEach((selector) => {
        const element = document.querySelector(selector);
        if (!element || observed.has(element)) return;
        observed.add(element);
        resizeObserver.observe(element);
        mutationObserver.observe(element, { attributes: true, attributeFilter: ['style', 'class'] });
      });
      update();
    };
    observe();
    // The layout may mount after the plugin, and remounts when the layout type changes
    const interval = window.setInterval(observe, 2000);
    window.addEventListener('resize', update);

    return () => {
      cancelAnimationFrame(frame);
      window.clearInterval(interval);
      window.removeEventListener('resize', update);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [position, positionWithPanelOpen]);

  return anchor;
};
