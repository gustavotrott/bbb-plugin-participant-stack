import styled, { css } from 'styled-components';
import { Design } from '../../commons/settings';
import { PopoverSide } from '../../hooks/use-anchor';

/*
 * Colors come from the BigBlueButton palette variables, with the stock values as
 * fallbacks, so the stack follows a theme that overrides them. The --pav-bg
 * family is replaced inline when the stack is docked in a bar (see use-surface).
 */
const lightTokens = css`
  --pav-surface: var(--color-white, #FFF);
  --pav-text: var(--color-gray-dark, #06172A);
  --pav-text-muted: var(--color-gray, #4E5A66);
  --pav-line: var(--color-gray-lighter, #E4E7EB);
  --pav-hover: rgba(6, 23, 42, 0.06);
  --pav-popover-shadow: 0 2px 6px rgba(6, 23, 42, 0.1), 0 12px 32px rgba(6, 23, 42, 0.22);
  --pav-bg: var(--pav-surface);
  --pav-fg: var(--pav-text);
  --pav-muted-bg: #E9ECF0;
  --pav-border: rgba(6, 23, 42, 0.1);
  --pav-shadow: 0 1px 2px rgba(6, 23, 42, 0.08), 0 2px 8px rgba(6, 23, 42, 0.14);
`;

const darkTokens = css`
  --pav-surface: var(--color-overlays-dark-theme, #2D2F38);
  --pav-text: var(--color-text-dark-theme, #FFF);
  --pav-text-muted: rgba(255, 255, 255, 0.68);
  --pav-line: rgba(255, 255, 255, 0.1);
  --pav-hover: rgba(255, 255, 255, 0.08);
  --pav-popover-shadow: 0 2px 6px rgba(0, 0, 0, 0.3), 0 12px 32px rgba(0, 0, 0, 0.5);
  --pav-bg: var(--pav-surface);
  --pav-fg: var(--pav-text);
  --pav-muted-bg: #454853;
  --pav-border: rgba(255, 255, 255, 0.1);
  --pav-shadow: 0 1px 2px rgba(0, 0, 0, 0.3), 0 2px 10px rgba(0, 0, 0, 0.35);
`;

interface RootProps {
  $docked: boolean;
  $vertical: boolean;
}

// Carries the colors for everything the plugin draws, without being a box itself
export const Scope = styled.div<{ $dark: boolean }>`
  ${({ $dark }) => ($dark ? darkTokens : lightTokens)}
  display: contents;
`;

export const Root = styled.div<RootProps>`
  --pav-size: 2.5rem;
  --pav-primary: var(--color-primary, #0F70D7);
  --pav-success: var(--color-success, #008081);
  --pav-danger: var(--color-danger, #DF2721);
  --pav-hand: #F5B700;
  --pav-radius: var(--participant-stack-radius, 999px);
  --pav-avatar-radius: var(--participant-stack-avatar-radius, 50%);

  position: ${({ $docked }) => ($docked ? 'fixed' : 'relative')};
  display: flex;
  flex-direction: ${({ $vertical }) => ($vertical ? 'column' : 'row')};
  align-items: center;
  gap: 0.5rem;
  width: max-content;
  box-sizing: border-box;
  color: var(--pav-fg);
  font-family: inherit;
  font-size: 0.875rem;
  line-height: 1.25;
  user-select: none;
  /* Only the items take clicks, never the gaps between them */
  pointer-events: none;

  & *,
  & *::before,
  & *::after {
    box-sizing: border-box;
  }

  @media (max-width: 640px) {
    --pav-size: 2rem;
    gap: 0.375rem;
  }
`;

interface ListProps {
  $design: Design;
  $vertical: boolean;
}

export const List = styled.ul<ListProps>`
  list-style: none;
  margin: 0;
  display: flex;
  flex-direction: ${({ $vertical }) => ($vertical ? 'column' : 'row')};
  align-items: center;
  pointer-events: auto;

  ${({ $design, $vertical }) => ($design === 'overlap' ? css`
    /* Room for the status badges and their rings, which hang off the avatars'
       lower end corner, so that nothing sticks out of the pill */
    padding: ${$vertical ? '0.3rem 0.5rem 0.4rem 0.3rem' : '0.3rem'};
    padding-inline-end: 0.5rem;
    border-radius: var(--pav-radius);
    background: var(--pav-bg);
    border: 1px solid var(--pav-border);
    box-shadow: var(--pav-shadow);

    & > li + li {
      ${$vertical ? 'margin-top' : 'margin-inline-start'}: -0.4rem;
    }
  ` : css`
    padding: 0;
    gap: ${$design === 'summary' ? '0.375rem' : '0.5rem'};
  `)}
`;

export const Entry = styled.li`
  position: relative;
  display: flex;

  &:hover,
  &:focus-within {
    z-index: 100 !important;
  }
`;

const resetButton = css`
  appearance: none;
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  &:focus-visible {
    outline: 2px solid var(--pav-primary);
    outline-offset: 2px;
  }
`;

export const AvatarButton = styled.button<{ $design: Design }>`
  ${resetButton}
  position: relative;
  display: block;
  width: var(--pav-size);
  height: var(--pav-size);
  transition: transform 0.12s ease;

  /* Themes restyle every button's corners; this one must keep the avatar's shape */
  border-radius: var(--pav-avatar-radius) !important;
  box-shadow: none !important;

  /* The ring that separates overlapping avatars (and lifts spaced ones off the
     content) is drawn by the avatar itself, which no button rule can reshape */
  & > span:first-child {
    box-shadow: 0 0 0 2px var(--pav-bg)${({ $design }) => ($design === 'spaced' ? ', var(--pav-shadow)' : '')};
  }

  &:hover,
  &[aria-expanded='true'] {
    transform: scale(1.08);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

interface AvatarFaceProps {
  $muted?: boolean;
  $small?: boolean;
}

export const AvatarFace = styled.span<AvatarFaceProps>`
  display: grid;
  place-items: center;
  width: ${({ $small }) => ($small ? '2rem' : '100%')};
  height: ${({ $small }) => ($small ? '2rem' : '100%')};
  flex: none;
  border-radius: var(--pav-avatar-radius);
  overflow: hidden;
  background: ${({ $muted }) => ($muted ? 'var(--pav-muted-bg)' : 'var(--pav-avatar-color, var(--pav-muted-bg))')};
  color: ${({ $muted }) => ($muted ? 'var(--pav-fg)' : '#FFF')};
  font-size: ${({ $small }) => ($small ? '0.75rem' : 'calc(var(--pav-size) * 0.36)')};
  font-weight: 600;
  letter-spacing: 0.01em;

  & > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

interface BadgeProps {
  $kind: 'presenter' | 'hand' | 'emoji' | 'waiting' | 'moderator';
  $slot?: 'lower' | 'upper';
}

export const Badge = styled.span<BadgeProps>`
  position: absolute;
  inset-inline-end: -0.3rem;
  ${({ $slot }) => ($slot === 'upper' ? 'top: -0.15rem;' : 'bottom: -0.15rem;')}
  display: grid;
  place-items: center;
  width: 1.2rem;
  height: 1.2rem;
  border-radius: 50%;
  box-shadow: 0 0 0 2px var(--pav-ring, var(--pav-bg));
  font-size: 0.75rem;
  line-height: 1;
  pointer-events: none;

  ${({ $kind }) => $kind === 'presenter' && css`
    background: var(--pav-primary);
    color: #FFF;
  `}
  ${({ $kind }) => ($kind === 'hand' || $kind === 'waiting') && css`
    background: var(--pav-hand);
    color: #3A2A00;
  `}
  ${({ $kind }) => $kind === 'moderator' && css`
    /* Smaller than a status badge: it says who the person is, not what they are doing */
    inset-inline-end: -0.2rem;
    width: 0.95rem;
    height: 0.95rem;
    background: var(--theme-moderator, #F5B700);
    color: #5C3D00;
    font-size: 0.6rem;

    & > svg {
      stroke-width: 2.6;
    }
  `}
  ${({ $kind }) => $kind === 'emoji' && css`
    background: #FFF;
    font-size: 0.8rem;
  `}
`;

// One counter of the summary design: "emoji 5", "hand 2"
export const Chip = styled.button<{ $tone?: 'hand' | 'waiting' }>`
  ${resetButton}
  display: flex;
  align-items: center;
  gap: 0.375rem;
  height: var(--pav-size);
  padding: 0 0.75rem 0 0.625rem;
  border-radius: var(--pav-radius);
  background: var(--pav-bg);
  border: 1px solid var(--pav-border);
  box-shadow: var(--pav-shadow);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  pointer-events: auto;

  & > svg,
  & > span:first-child {
    font-size: 1.05rem;
    line-height: 1;
  }

  ${({ $tone }) => $tone === 'hand' && css`
    & > svg {
      color: var(--pav-hand);
    }
  `}
  ${({ $tone }) => $tone === 'waiting' && css`
    color: var(--pav-hand);
    border-color: color-mix(in srgb, var(--pav-hand) 55%, transparent);
    background: color-mix(in srgb, var(--pav-hand) 14%, var(--pav-bg));
  `}

  &:hover,
  &[aria-expanded='true'] {
    filter: brightness(1.08);
  }
`;

// Opens the user's own options for the stack; deliberately quiet
export const MoreButton = styled.button`
  ${resetButton}
  display: grid;
  place-items: center;
  width: 1.375rem;
  height: 1.75rem;
  margin-inline-start: -0.125rem;
  border-radius: 0.5rem;
  /* Its own surface: over the content there is no bar behind it to contrast with */
  background: var(--pav-bg);
  box-shadow: var(--pav-shadow);
  font-size: 1.125rem;
  pointer-events: auto;

  & > svg {
    opacity: 0.6;
  }

  &:hover,
  &[aria-expanded='true'] {
    background: var(--pav-muted-bg);
  }

  &:hover > svg,
  &[aria-expanded='true'] > svg {
    opacity: 1;
  }
`;

// The meeting title, redrawn smaller where the stack left room for it
export const TitleButton = styled.button`
  ${resetButton}
  position: fixed;
  display: block;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  color: var(--pav-fg);
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  pointer-events: auto;

  &:hover {
    background: color-mix(in srgb, currentColor 12%, transparent);
  }
`;

export const MenuLabel = styled.div`
  padding: 0.5rem 1rem 0.25rem;
  color: var(--pav-text-muted);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

export const Separator = styled.span<{ $vertical: boolean }>`
  flex: none;
  background: var(--pav-border);
  ${({ $vertical }) => ($vertical ? 'width: 1.25rem; height: 1px;' : 'width: 1px; height: 1.25rem;')}
`;

// The name (and status) of the item under the pointer
export const Tip = styled.span<{ $side: PopoverSide }>`
  position: absolute;
  z-index: 150;
  ${({ $side }) => $side === 'below' && 'top: calc(100% + 0.5rem); left: 50%; translate: -50% 0;'}
  ${({ $side }) => $side === 'above' && 'bottom: calc(100% + 0.5rem); left: 50%; translate: -50% 0;'}
  ${({ $side }) => $side === 'beside' && 'inset-inline-start: calc(100% + 0.625rem); top: 50%; translate: 0 -50%;'}
  display: none;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
  width: max-content;
  max-width: 16rem;
  padding: 0.375rem 0.625rem;
  border-radius: 0.5rem;
  background: var(--pav-tip-bg, #06172A);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
  color: #FFF;
  font-size: 0.8125rem;
  line-height: 1.3;
  text-align: center;
  pointer-events: none;

  & > strong {
    font-weight: 600;
  }

  & > span {
    opacity: 0.75;
    font-size: 0.75rem;
  }

  & > strong,
  & > span {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Keyboard focus only: after a click the button keeps the focus, and the
     label would stay behind once its menu closes */
  *:hover > &,
  button:focus-visible ~ & {
    display: flex;
  }
`;

export const PopoverBox = styled.div<{ $side: PopoverSide }>`
  position: absolute;
  z-index: 200;
  ${({ $side }) => $side === 'below' && 'top: calc(100% + 0.625rem); inset-inline-start: 0;'}
  ${({ $side }) => $side === 'above' && 'bottom: calc(100% + 0.625rem); inset-inline-start: 0;'}
  ${({ $side }) => $side === 'beside' && 'inset-inline-start: calc(100% + 0.75rem); top: 0;'}
  width: max-content;
  min-width: 15rem;
  max-width: min(20rem, calc(100vw - 1rem));
  padding: 0.375rem 0;
  border-radius: var(--participant-stack-popover-radius, 1rem);
  background: var(--pav-surface);
  color: var(--pav-text);
  box-shadow: var(--pav-popover-shadow);
  font-weight: 400;
  text-align: start;
  cursor: default;
  pointer-events: auto;
  user-select: text;
`;

export const PopoverHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 1rem 0.75rem;
  border-bottom: 1px solid var(--pav-line);
  margin-bottom: 0.375rem;

  &:last-child {
    border-bottom: 0;
    margin-bottom: 0;
    padding-bottom: 0.625rem;
  }
`;

export const PopoverTitle = styled.div`
  min-width: 0;
  font-size: 0.9375rem;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const PopoverSubtitle = styled.div`
  margin-top: 0.125rem;
  color: var(--pav-text-muted);
  font-size: 0.8125rem;
  font-weight: 400;
  white-space: normal;
`;

export const MenuList = styled.div`
  display: flex;
  flex-direction: column;
`;

export const MenuAction = styled.button<{ $tone?: 'success' | 'danger' }>`
  ${resetButton}
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.5625rem 1rem;
  text-align: start;
  color: ${({ $tone }) => {
    if ($tone === 'success') return 'var(--pav-success)';
    if ($tone === 'danger') return 'var(--pav-danger)';
    return 'inherit';
  }};
  font-weight: ${({ $tone }) => ($tone ? 600 : 400)};

  & > svg {
    flex: none;
    font-size: 1.125rem;
    color: ${({ $tone }) => ($tone ? 'inherit' : 'var(--pav-text-muted)')};
  }

  & > span {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &[aria-checked='true'] {
    font-weight: 600;
  }

  &[aria-checked='true'] > svg {
    color: var(--pav-primary);
  }

  &[aria-checked='false'] > svg {
    visibility: hidden;
  }

  &:hover {
    background: var(--pav-hover);
  }

  &:focus-visible {
    outline-offset: -2px;
  }
`;

export const MenuFooter = styled.div`
  margin-top: 0.375rem;
  padding-top: 0.375rem;
  border-top: 1px solid var(--pav-line);
`;

export const UserRows = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: min(16rem, 45vh);
  overflow-y: auto;
`;

export const UserRow = styled.li`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.375rem 1rem;
  --pav-ring: var(--pav-surface);
`;

// Closes a list that could not name everyone
export const MoreUsers = styled.li`
  padding: 0.5rem 1rem 0.375rem;
  color: var(--pav-text-muted);
  font-size: 0.8125rem;
  font-weight: 600;
`;

export const UserRowAvatar = styled.span`
  position: relative;
  flex: none;
  display: flex;

  /* Smaller avatar, so the badge moves out to keep the initials readable */
  & > span + span {
    inset-inline-end: -0.45rem;
    bottom: -0.35rem;
    width: 1.05rem;
    height: 1.05rem;
    font-size: 0.7rem;
  }
`;

export const UserRowName = styled.span`
  flex: 1;
  min-width: 0;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const RowButton = styled.button<{ $tone?: 'success' | 'danger' }>`
  ${resetButton}
  flex: none;
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  font-size: 1.125rem;
  color: ${({ $tone }) => {
    if ($tone === 'success') return 'var(--pav-success)';
    if ($tone === 'danger') return 'var(--pav-danger)';
    return 'var(--pav-text-muted)';
  }};
  background: ${({ $tone }) => {
    if ($tone === 'success') return 'color-mix(in srgb, var(--pav-success) 12%, transparent)';
    if ($tone === 'danger') return 'color-mix(in srgb, var(--pav-danger) 12%, transparent)';
    return 'transparent';
  }};

  &:hover {
    filter: brightness(0.92);
    background-color: ${({ $tone }) => (!$tone ? 'var(--pav-hover)' : undefined)};
  }
`;
