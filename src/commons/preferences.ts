import { useSyncExternalStore } from 'react';
import { Position, POSITIONS, Settings } from './settings';

/*
 * What each user chose for themselves: whether the stack is hidden and where it
 * sits. Kept in the browser, so it is remembered in the next meeting too.
 *
 * The plugin and the stack live in two separate React roots (the stack is
 * rendered inside a floating window), hence a tiny store instead of context.
 */
export interface Preferences {
  hidden: boolean;
  position?: Position;
}

const STORAGE_KEY = 'bbb-plugin-participant-stack:preferences';

const load = (): Preferences => {
  try {
    const raw = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}') ?? {};
    return {
      hidden: raw.hidden === true,
      position: POSITIONS.includes(raw.position) ? raw.position : undefined,
    };
  } catch {
    return { hidden: false };
  }
};

let current = load();
const listeners = new Set<() => void>();

export const setPreferences = (change: Partial<Preferences>) => {
  current = { ...current, ...change };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // Storage blocked: the choice still holds for this session
  }
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const usePreferences = (): Preferences => useSyncExternalStore(subscribe, () => current);

/** The administrator's settings with the user's own choices applied where allowed. */
export const applyPreferences = (
  settings: Settings,
  preferences: Preferences,
): { position: Position; positionWithPanelOpen?: Position; hidden: boolean } => {
  const hidden = settings.userCanHide && preferences.hidden;
  const chosen = settings.userCanMove && preferences.position
    && settings.positions.includes(preferences.position)
    ? preferences.position
    : undefined;
  // A place the user picked is where they want it, panel open or not
  if (chosen) return { position: chosen, hidden };
  return {
    position: settings.position,
    positionWithPanelOpen: settings.positionWithPanelOpen,
    hidden,
  };
};
