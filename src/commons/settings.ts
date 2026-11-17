import { PluginApi } from 'bigbluebutton-html-plugin-sdk';
import { useMemo } from 'react';

export const POSITIONS = [
  'navbar-left',
  'navbar-center',
  'media-top-left',
  'media-top-center',
  'media-left',
  'actions-bar-left',
  'floating',
] as const;
export type Position = typeof POSITIONS[number];

export const VISIBLE_TO = ['all', 'moderators', 'presenter', 'moderators-and-presenter'] as const;
export type VisibleTo = typeof VISIBLE_TO[number];

export const EXPAND_ON_HOVER = ['activity', 'always', 'never'] as const;
export type ExpandOnHover = typeof EXPAND_ON_HOVER[number];

export const COUNTERS = ['total', 'hidden'] as const;
export type Counter = typeof COUNTERS[number];

export const DESIGNS = ['overlap', 'spaced', 'summary'] as const;
export type Design = typeof DESIGNS[number];

export interface Settings {
  // Where the stack is docked. 'floating' is a window the user can drag around.
  position: Position;
  // Where it is docked instead while a sidebar panel (chat, notes, ...) is open and
  // the bars are narrower. Unset: the same place. Not used with 'floating'.
  positionWithPanelOpen?: Position;
  // The user list already shows raised hands, reactions and waiting users
  hideWhenUserListOpen: boolean;
  // overlap: avatars overlapping inside a pill; spaced: separate avatars, no pill;
  // summary: one counter chip per kind of activity
  design: Design;
  // Most items shown at rest, so a full meeting does not clutter the bar; the rest
  // collapse into "+N". Fewer are shown when the bar runs out of room, and all that
  // fit while the pointer is on the stack.
  maxVisible: number;
  // What the pointer on the stack does. 'activity': expands only when something
  // going on is out of sight (a hand, a reaction, waiting users); the users with
  // nothing going on stay in the "+N" menu. 'always': shows every user that fits.
  // 'never': the stack keeps its size.
  expandOnHover: ExpandOnHover;
  // Phones have no room in the bars and no hover; off by default there
  showOnMobile: boolean;
  // The last item of the stack. 'total': the number of users in the meeting, opening
  // the list of everyone. 'hidden': "+N", the users that did not fit, opening those.
  counter: Counter;
  // From this many users with the same reaction on, they become one "N x emoji" item
  groupReactionsFrom: number;
  showPresenter: boolean;
  // After everyone with something going on, fill the remaining room with the other
  // users, so the stack doubles as a glance at who is in the meeting
  showIdleUsers: boolean;
  // Who gets the stack at all
  visibleTo: VisibleTo;
  // Lets each user hide the stack (and bring it back from the options menu)
  userCanHide: boolean;
  // Lets each user pick one of `positions` for themselves
  userCanMove: boolean;
  // The positions offered to users
  positions: Position[];
}

export const DEFAULT_SETTINGS: Settings = {
  position: 'navbar-left',
  positionWithPanelOpen: undefined,
  hideWhenUserListOpen: true,
  design: 'overlap',
  maxVisible: 15,
  counter: 'total',
  expandOnHover: 'activity',
  showOnMobile: false,
  groupReactionsFrom: 3,
  showPresenter: true,
  showIdleUsers: true,
  visibleTo: 'moderators-and-presenter',
  userCanHide: true,
  userCanMove: true,
  positions: [
    'navbar-left', 'navbar-center', 'actions-bar-left', 'media-top-center', 'media-left', 'floating',
  ],
};

// For trying things out without touching the server: in the browser console,
// localStorage.setItem('bbb-plugin-participant-stack', '{"position":"media-left"}')
export const LOCAL_OVERRIDE_KEY = 'bbb-plugin-participant-stack';

const readLocalOverride = (): Record<string, unknown> => {
  try {
    const raw = window.localStorage.getItem(LOCAL_OVERRIDE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const oneOf = <T extends string | undefined>(
  value: unknown,
  options: readonly T[],
  fallback: T,
): T => (
    options.includes(value as T) ? value as T : fallback
  );

const positiveInt = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : fallback;
};

const bool = (value: unknown, fallback: boolean): boolean => {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return fallback;
};

// Accepts a list or a comma-separated string; unknown names are dropped
const positionList = (value: unknown): Position[] => {
  const names = typeof value === 'string' ? value.split(',').map((name) => name.trim()) : value;
  if (!Array.isArray(names)) return DEFAULT_SETTINGS.positions;
  const valid = POSITIONS.filter((position) => names.includes(position));
  return valid.length ? valid : DEFAULT_SETTINGS.positions;
};

const DOCKED = POSITIONS.filter((position) => position !== 'floating');

export const parseSettings = (raw: Record<string, unknown>): Settings => ({
  position: oneOf(raw.position, POSITIONS, DEFAULT_SETTINGS.position),
  positionWithPanelOpen: raw.position === 'floating'
    ? undefined
    : oneOf<Position | undefined>(raw.positionWithPanelOpen as Position, DOCKED, undefined),
  hideWhenUserListOpen: bool(raw.hideWhenUserListOpen, DEFAULT_SETTINGS.hideWhenUserListOpen),
  design: oneOf(raw.design, DESIGNS, DEFAULT_SETTINGS.design),
  maxVisible: positiveInt(raw.maxVisible, DEFAULT_SETTINGS.maxVisible),
  counter: oneOf(raw.counter, COUNTERS, DEFAULT_SETTINGS.counter),
  expandOnHover: oneOf(raw.expandOnHover, EXPAND_ON_HOVER, DEFAULT_SETTINGS.expandOnHover),
  showOnMobile: bool(raw.showOnMobile, DEFAULT_SETTINGS.showOnMobile),
  groupReactionsFrom: positiveInt(raw.groupReactionsFrom, DEFAULT_SETTINGS.groupReactionsFrom),
  showPresenter: bool(raw.showPresenter, DEFAULT_SETTINGS.showPresenter),
  showIdleUsers: bool(raw.showIdleUsers, DEFAULT_SETTINGS.showIdleUsers),
  visibleTo: oneOf(raw.visibleTo, VISIBLE_TO, DEFAULT_SETTINGS.visibleTo),
  userCanHide: bool(raw.userCanHide, DEFAULT_SETTINGS.userCanHide),
  userCanMove: bool(raw.userCanMove, DEFAULT_SETTINGS.userCanMove),
  positions: positionList(raw.positions),
});

export const canSee = (
  visibleTo: VisibleTo,
  user: { isModerator: boolean; presenter: boolean },
): boolean => {
  switch (visibleTo) {
    case 'moderators': return user.isModerator;
    case 'presenter': return user.presenter;
    case 'moderators-and-presenter': return user.isModerator || user.presenter;
    default: return true;
  }
};

export const useSettings = (pluginApi: PluginApi): { settings: Settings; loading: boolean } => {
  const { data, loading } = pluginApi.usePluginSettings!() || { data: undefined, loading: true };
  const serialized = JSON.stringify(data ?? {});
  const settings = useMemo(() => parseSettings({
    ...JSON.parse(serialized),
    ...readLocalOverride(),
  }), [serialized]);
  return { settings, loading: !!loading };
};
