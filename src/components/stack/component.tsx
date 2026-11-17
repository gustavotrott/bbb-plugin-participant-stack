import * as React from 'react';
import { PluginApi, UserListUiDataNames } from 'bigbluebutton-html-plugin-sdk';
import { MeetingData } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/domain/meeting/meeting-data/types';
import { messages, useGetInternationalization } from '../../commons/intl';
import { Position, Settings } from '../../commons/settings';
import { setPreferences } from '../../commons/preferences';
import { StackEntry, Viewer, WaitingUser } from '../../commons/types';
import {
  CheckIcon, ClockIcon, DotsIcon, EyeOffIcon, HandIcon, InfoIcon,
} from '../../commons/icons';
import {
  CLEAR_ALL_REACTION,
  SET_LOCKED,
  SET_PRESENTER,
  SET_RAISE_HAND,
  SET_REACTION_EMOJI,
  SET_ROLE,
  SUBMIT_APPROVAL_STATUS,
} from '../../graphql/mutations';
import {
  buildEntries, limitEntries, useActivity, useWaitingUsers,
} from '../../hooks/use-activity';
import { defaultSize, TITLE_SELECTOR, useAnchor } from '../../hooks/use-anchor';
import { useSurface } from '../../hooks/use-surface';
import { useMeetingTitle } from '../../hooks/use-meeting-title';
import { Avatar, StatusBadge } from '../avatar/component';
import { Popover } from '../popover/component';
import {
  Actions, statusOf, UserListMenu, UserMenu, WaitingMenu,
} from '../menus/component';
import {
  AvatarButton,
  AvatarFace,
  Badge,
  Chip,
  Entry,
  List,
  MenuAction,
  MenuFooter,
  MenuLabel,
  MenuList,
  MoreButton,
  Root,
  Scope,
  Separator,
  Tip,
  TitleButton,
} from './styles';

interface StackProps {
  pluginApi: PluginApi;
  settings: Settings;
  // Where this user has the stack: the configured position or their own choice
  position: Position;
  positionWithPanelOpen?: Position;
}

const USER_LIST_CLOSED = { value: false };
// Long enough to cross the gap between the stack and one of its menus
const COLLAPSE_DELAY_MS = 250;
const canHover = () => window.matchMedia?.('(hover: hover)').matches ?? true;

const WAITING_KEY = 'waiting';
const MORE_KEY = 'more';

// Only the lock settings are needed; a stable function keeps the SDK from resubscribing
const pickLockSettings = (meeting: MeetingData) => ({ lockSettings: meeting.lockSettings });

// The waiting room is subscribed to only while a moderator is looking
function WaitingUsersSource({ pluginApi, onChange }: {
  pluginApi: PluginApi;
  onChange: (users: WaitingUser[]) => void;
}): null {
  const users = useWaitingUsers(pluginApi);
  React.useEffect(() => {
    onChange(users);
    return () => onChange([]);
  }, [users]);
  return null;
}

const NO_WAITING: WaitingUser[] = [];

function Stack({
  pluginApi, settings, position: basePosition, positionWithPanelOpen = undefined,
}: StackProps) {
  const { intl } = useGetInternationalization(pluginApi);
  const { data: currentUser } = pluginApi.useCurrentUser!() || {};
  const { data: meeting } = pluginApi.useMeetingData!(pickLockSettings) || {};
  const activity = useActivity(pluginApi);
  const [waiting, setWaiting] = React.useState<WaitingUser[]>(NO_WAITING);
  const [open, setOpen] = React.useState<string | null>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);

  const userList = pluginApi.useUiData!(UserListUiDataNames.USER_LIST_IS_OPEN, USER_LIST_CLOSED);
  const docked = basePosition !== 'floating';
  const anchor = useAnchor(basePosition, positionWithPanelOpen);
  const { position } = anchor;
  const { dark, vars } = useSurface(anchor.bar);
  // Not while a small screen has pushed the stack out of the bar
  const replacesTitle = position === 'navbar-center' && !!anchor.titleStyle;

  // With the pointer on it (or a menu open, or keyboard focus inside) the stack may
  // expand: it shows what it holds back to stay small (see `expandOnHover`).
  const [hovered, setHovered] = React.useState(false);
  const collapseTimer = React.useRef<number>();
  const hover = (value: boolean) => () => {
    window.clearTimeout(collapseTimer.current);
    if (value) setHovered(true);
    else collapseTimer.current = window.setTimeout(() => setHovered(false), COLLAPSE_DELAY_MS);
  };
  React.useEffect(() => () => window.clearTimeout(collapseTimer.current), []);
  const canMove = settings.userCanMove && settings.positions.length > 1;
  const hasMore = settings.userCanHide || canMove || replacesTitle;

  const [setRaiseHand] = pluginApi.useCustomMutation!(SET_RAISE_HAND);
  const [setReactionEmoji] = pluginApi.useCustomMutation!(SET_REACTION_EMOJI);
  const [clearAllReaction] = pluginApi.useCustomMutation!(CLEAR_ALL_REACTION);
  const [setLocked] = pluginApi.useCustomMutation!(SET_LOCKED);
  const [setPresenter] = pluginApi.useCustomMutation!(SET_PRESENTER);
  const [setRole] = pluginApi.useCustomMutation!(SET_ROLE);
  const [submitApprovalStatus] = pluginApi.useCustomMutation!(SUBMIT_APPROVAL_STATUS);

  const actions: Actions = {
    lowerHand: (userId) => setRaiseHand?.({ variables: { userId, raiseHand: false } }),
    removeOwnReaction: () => setReactionEmoji?.({ variables: { reactionEmoji: 'none' } }),
    clearReactions: () => clearAllReaction?.({ variables: {} }),
    setLocked: (userId, locked) => setLocked?.({ variables: { userId, locked } }),
    makePresenter: (userId) => setPresenter?.({ variables: { userId } }),
    setRole: (userId, role) => setRole?.({ variables: { userId, role } }),
    answerGuests: (userIds, status) => submitApprovalStatus?.({
      variables: { guests: userIds.map((guest) => ({ guest, status })) },
    }),
  };

  const viewer: Viewer = {
    userId: currentUser?.userId ?? '',
    isModerator: currentUser?.role === 'MODERATOR',
    hasActiveLockSetting: !!meeting?.lockSettings?.hasActiveLockSetting,
  };

  const hasWaiting = viewer.isModerator && waiting.length > 0;

  // The pointer is on the stack, keyboard focus is inside it or one of its menus is open
  const engaged = hovered || open !== null;
  // At rest the options button only shows where there is no pointer to reveal it
  const showMore = hasMore && (engaged || !canHover());

  const { entries, showWaiting, expanded } = React.useMemo(() => {
    // How many items fit in the free space of the bar the stack is docked in
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const size = anchor.size ?? defaultSize();
    const steps = { overlap: size - 0.4 * rem, spaced: size + 0.5 * rem, summary: 4.5 * rem };
    const fitIn = (width: number) => Math.max(
      1,
      Math.floor((width - 0.75 * rem - size) / steps[settings.design]) + 1,
    );
    // Users with the same reaction are shown one by one while everyone with
    // something going on fits, and become one item only when they do not
    const separate = buildEntries(activity, settings, false);
    const busy = separate.filter((entry) => entry.kind !== 'user'
      || entry.user.presenter || entry.user.raiseHand || entry.user.emoji).length;

    const layout = (room: number, spread: boolean, reserveMore: boolean) => {
      const forItems = room - (reserveMore ? 1.5 * rem : 0);
      const withWaiting = fitIn(forItems - 5.5 * rem);
      const capacity = Math.min(
        spread ? Infinity : settings.maxVisible,
        hasWaiting ? withWaiting : fitIn(forItems),
      );
      const all = busy > capacity ? buildEntries(activity, settings, true) : separate;
      // Spread out, everything that fits is shown, past the usual limit
      const wanted = spread ? all.length : Math.min(all.length, settings.maxVisible);
      // Short of room, the avatars come first: the waiting pill appears on expanding
      const waitingFits = hasWaiting && (spread || withWaiting >= wanted);
      const fit = Math.min(wanted, waitingFits ? withWaiting : fitIn(forItems));
      return {
        entries: limitEntries(all, fit, activity.total),
        showWaiting: waitingFits,
        // Something going on is out of sight: a reason to expand
        holdsBack: busy > capacity || (hasWaiting && !waitingFits),
      };
    };

    // The options button is small enough to sit past the room kept for the items,
    // so revealing it at rest moves nothing
    const rest = layout(anchor.available, false, hasMore && !canHover());
    const mayExpand = settings.expandOnHover === 'always'
      || (settings.expandOnHover === 'activity' && rest.holdsBack);
    if (engaged && mayExpand) {
      return {
        ...layout(anchor.availableExpanded ?? anchor.available, true, hasMore),
        expanded: true,
      };
    }
    return { ...rest, expanded: false };
  }, [activity, settings, anchor, engaged, hasWaiting, hasMore]);

  // Expanded in the top bar, the stack may reach the meeting title, which gives way
  const [coversTitle, setCoversTitle] = React.useState(false);
  React.useLayoutEffect(() => {
    const titleRect = expanded && !replacesTitle
      ? document.querySelector(TITLE_SELECTOR)?.getBoundingClientRect()
      : undefined;
    const rect = rootRef.current?.getBoundingClientRect();
    setCoversTitle(!!titleRect && !!rect
      && rect.right > titleRect.left - 12 && rect.left < titleRect.right + 12);
  });
  const { title, openDetails } = useMeetingTitle(replacesTitle || coversTitle);

  // Waiting users are too important to go unnoticed while their pill is held back
  const waitingHint = hasWaiting && !showWaiting;

  const close = React.useCallback(() => setOpen(null), []);

  React.useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event: Event) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('mousedown', onPointerDown, true);
    document.addEventListener('touchstart', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown, true);
      document.removeEventListener('touchstart', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, close]);

  // A menu whose item is gone (hand lowered, reaction over, guests answered) closes itself
  const openEntry = entries.find((entry) => entry.key === open);
  React.useEffect(() => {
    if (!open || open === MORE_KEY) return;
    if (open === WAITING_KEY ? !showWaiting : !openEntry) close();
  }, [open, openEntry, showWaiting, close]);

  const waitingSource = viewer.isModerator
    ? <WaitingUsersSource pluginApi={pluginApi} onChange={setWaiting} />
    : null;

  const hidden = !intl
    || !currentUser
    || (settings.hideWhenUserListOpen && !!userList?.value)
    || (docked && !anchor.style)
    || (entries.length === 0 && !hasWaiting);
  if (hidden) return waitingSource;

  const toggle = (key: string) => () => setOpen((current) => (current === key ? null : key));
  const groupTitle = (entry: StackEntry) => {
    if (entry.kind === 'reactions') return `${entry.emoji} ${entry.users.length}`;
    if (entry.kind === 'hands') return `${intl.formatMessage(messages.raisedHands)} (${entry.users.length})`;
    return `+${entry.kind === 'overflow' ? entry.count : ''}`;
  };

  const renderTrigger = (entry: StackEntry) => {
    const isOpen = open === entry.key;
    const common = {
      type: 'button' as const,
      'aria-haspopup': 'dialog' as const,
      'aria-expanded': isOpen,
      onClick: toggle(entry.key),
    };
    if (entry.kind === 'user') {
      const label = [entry.user.name, statusOf(entry.user, viewer, intl)]
        .filter(Boolean).join(' — ');
      return (
        <AvatarButton
          {...common}
          $design={settings.design}
          aria-label={label}
        >
          <Avatar user={entry.user} />
          <StatusBadge user={entry.user} />
        </AvatarButton>
      );
    }
    const names = entry.users.map((u) => u.name).join(', ');
    const waitingNote = entry.kind === 'overflow' && waitingHint
      ? ` · ${intl.formatMessage(messages.waitingUsers)} (${waiting.length})`
      : '';
    const label = `${groupTitle(entry)}: ${names}${waitingNote}`;
    if (entry.kind === 'hands' || (entry.kind === 'reactions' && settings.design === 'summary')) {
      return (
        <Chip
          {...common}
          $tone={entry.kind === 'hands' ? 'hand' : undefined}
          aria-label={label}
        >
          {entry.kind === 'hands' ? <HandIcon /> : <span aria-hidden>{entry.emoji}</span>}
          {entry.users.length}
        </Chip>
      );
    }
    return (
      <AvatarButton
        {...common}
        $design={settings.design}
        aria-label={label}
      >
        <AvatarFace $muted>
          {entry.kind === 'overflow' ? `+${entry.count}` : entry.users.length}
        </AvatarFace>
        {entry.kind === 'reactions' && <Badge $kind="emoji">{entry.emoji}</Badge>}
        {entry.kind === 'overflow' && waitingHint && <Badge $kind="waiting"><ClockIcon /></Badge>}
      </AvatarButton>
    );
  };

  // Shown at once on hover, unlike a native tooltip: reading who raised a hand
  // must not take a click or a wait
  const renderTip = (entry: StackEntry) => {
    if (entry.kind === 'user') {
      const status = statusOf(entry.user, viewer, intl);
      return (
        <Tip className="bbb-participant-stack__tip" $side={anchor.popoverSide} aria-hidden>
          <strong>{entry.user.name}</strong>
          {status && <span>{status}</span>}
        </Tip>
      );
    }
    const names = entry.users.slice(0, 6).map((u) => u.name).join(', ');
    return (
      <Tip className="bbb-participant-stack__tip" $side={anchor.popoverSide} aria-hidden>
        <strong>{groupTitle(entry)}</strong>
        <span>{entry.users.length > 6 ? `${names}…` : names}</span>
      </Tip>
    );
  };

  const renderMenu = (entry: StackEntry) => {
    if (entry.kind === 'user') {
      return (
        <Popover side={anchor.popoverSide} label={entry.user.name}>
          <UserMenu
            user={entry.user}
            viewer={viewer}
            intl={intl}
            actions={actions}
            onDone={close}
          />
        </Popover>
      );
    }
    let footer: 'lowerAllHands' | 'clearReactions' | undefined;
    if (entry.kind === 'hands') footer = 'lowerAllHands';
    if (entry.kind === 'reactions') footer = 'clearReactions';
    return (
      <Popover side={anchor.popoverSide} label={groupTitle(entry)}>
        <UserListMenu
          title={groupTitle(entry)}
          users={entry.users}
          more={entry.kind === 'overflow' ? entry.count - entry.users.length : 0}
          viewer={viewer}
          intl={intl}
          actions={actions}
          footer={footer}
          onDone={close}
        />
      </Popover>
    );
  };

  const sizeVar = anchor.size
    ? { '--pav-size': `${anchor.size}px` } as React.CSSProperties
    : undefined;

  const moreMenu = (
    <Popover side={anchor.popoverSide} label={intl.formatMessage(messages.options)}>
      <MenuList role="menu">
        {replacesTitle && title && (
          <MenuAction
            type="button"
            role="menuitem"
            onClick={() => {
              close();
              openDetails();
            }}
          >
            <InfoIcon />
            <span>{title}</span>
          </MenuAction>
        )}
        {canMove && (
          <>
            <MenuLabel>{intl.formatMessage(messages.position)}</MenuLabel>
            {settings.positions.map((option) => (
              <MenuAction
                key={option}
                type="button"
                role="menuitemradio"
                aria-checked={option === position}
                onClick={() => {
                  close();
                  setPreferences({ position: option });
                }}
              >
                <CheckIcon />
                <span>{intl.formatMessage(messages[`position.${option}`])}</span>
              </MenuAction>
            ))}
          </>
        )}
      </MenuList>
      {settings.userCanHide && (
        <MenuFooter>
          <MenuAction type="button" onClick={() => setPreferences({ hidden: true })}>
            <EyeOffIcon />
            <span>{intl.formatMessage(messages.hide)}</span>
          </MenuAction>
        </MenuFooter>
      )}
    </Popover>
  );

  return (
    <Scope $dark={dark} style={vars}>
      {replacesTitle && title && (
        <TitleButton
          type="button"
          className="bbb-participant-stack__title"
          style={anchor.titleStyle}
          title={title}
          onClick={openDetails}
        >
          {title}
        </TitleButton>
      )}
      <Root
        ref={rootRef}
        className={`bbb-participant-stack bbb-participant-stack--${settings.design} bbb-participant-stack--${position}`}
        role="region"
        aria-label={intl.formatMessage(messages.stackLabel)}
        $docked={docked}
        $vertical={anchor.vertical}
        style={docked ? { ...anchor.style, ...sizeVar } : undefined}
        onMouseEnter={hover(true)}
        onMouseLeave={hover(false)}
        onFocus={hover(true)}
        onBlur={hover(false)}
      >
        {waitingSource}
        {entries.length > 0 && (
        <List className="bbb-participant-stack__list" $design={settings.design} $vertical={anchor.vertical}>
          {entries.map((entry, index) => (
            <Entry
              key={entry.key}
              className={`bbb-participant-stack__item bbb-participant-stack__item--${entry.kind}`}
              // Earlier items sit on top, so every badge stays readable
              style={{ zIndex: open === entry.key ? 100 : entries.length - index }}
            >
              {renderTrigger(entry)}
              {open === entry.key ? renderMenu(entry) : renderTip(entry)}
            </Entry>
          ))}
        </List>
        )}
        {showWaiting && (
        <>
          {entries.length > 0 && <Separator $vertical={anchor.vertical} aria-hidden />}
          <Entry as="div" className="bbb-participant-stack__waiting">
            <Chip
              type="button"
              $tone="waiting"
              aria-haspopup="dialog"
              aria-expanded={open === WAITING_KEY}
              aria-label={`${intl.formatMessage(messages.waitingUsers)} (${waiting.length})`}
              onClick={toggle(WAITING_KEY)}
            >
              <ClockIcon />
              {waiting.length}
            </Chip>
            {open === WAITING_KEY ? (
              <Popover side={anchor.popoverSide} label={intl.formatMessage(messages.waitingUsers)}>
                <WaitingMenu users={waiting} intl={intl} actions={actions} onDone={close} />
              </Popover>
            ) : (
              <Tip className="bbb-participant-stack__tip" $side={anchor.popoverSide} aria-hidden>
                <strong>{`${intl.formatMessage(messages.waitingUsers)} (${waiting.length})`}</strong>
                <span>{waiting.slice(0, 6).map((u) => u.name).join(', ')}</span>
              </Tip>
            )}
          </Entry>
        </>
        )}
        {showMore && (
        <Entry as="div" className="bbb-participant-stack__more">
          <MoreButton
            type="button"
            aria-haspopup="menu"
            aria-expanded={open === MORE_KEY}
            aria-label={intl.formatMessage(messages.options)}
            onClick={toggle(MORE_KEY)}
          >
            <DotsIcon />
          </MoreButton>
          {open === MORE_KEY && moreMenu}
        </Entry>
        )}
      </Root>
    </Scope>
  );
}

export default Stack;
