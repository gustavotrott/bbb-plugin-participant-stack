import * as React from 'react';
import { IntlShape } from 'react-intl';
import { messages } from '../../commons/intl';
import { ActivityUser, Viewer, WaitingUser } from '../../commons/types';
import {
  AllowAllIcon,
  BackIcon,
  CheckIcon,
  CloseIcon,
  HandOffIcon,
  LockIcon,
  PresenterIcon,
  ShieldIcon,
  TrashIcon,
  UnlockIcon,
  UserIcon,
} from '../../commons/icons';
import { Avatar, StatusBadge } from '../avatar/component';
import {
  MenuAction,
  MenuFooter,
  BackButton,
  MenuList,
  MoreUsers,
  PopoverHeader,
  PopoverSubtitle,
  PopoverTitle,
  RowButton,
  UserRow,
  UserRowAvatar,
  UserRowName,
  UserRows,
} from '../stack/styles';

export interface Actions {
  lowerHand: (userId: string) => void;
  removeOwnReaction: () => void;
  clearReactions: () => void;
  setLocked: (userId: string, locked: boolean) => void;
  makePresenter: (userId: string) => void;
  setRole: (userId: string, role: 'MODERATOR' | 'VIEWER') => void;
  answerGuests: (userIds: string[], status: 'ALLOW' | 'DENY') => void;
}

export const statusOf = (user: ActivityUser, viewer: Viewer, intl: IntlShape): string => [
  user.userId === viewer.userId && intl.formatMessage(messages.you),
  user.presenter && intl.formatMessage(messages.presenter),
  user.isModerator && intl.formatMessage(messages.moderator),
  user.raiseHand && intl.formatMessage(messages.raisedHand),
  user.emoji,
  user.locked && !user.isModerator && viewer.hasActiveLockSetting
    && intl.formatMessage(messages.locked),
].filter(Boolean).join(' · ');

interface UserMenuProps {
  user: ActivityUser;
  viewer: Viewer;
  intl: IntlShape;
  actions: Actions;
  onDone: () => void;
}

// What each action allows mirrors the client's user list (generateActionsPermissions)
export function UserMenu({
  user, viewer, intl, actions, onDone,
}: UserMenuProps) {
  const isSelf = user.userId === viewer.userId;
  const mod = viewer.isModerator;
  const run = (action: () => void) => () => {
    action();
    onDone();
  };
  const canChangeLock = mod && !user.isModerator && viewer.hasActiveLockSetting
    && typeof user.locked === 'boolean';

  const items = [
    user.raiseHand && (mod || isSelf) && (
      <MenuAction key="hand" type="button" onClick={run(() => actions.lowerHand(user.userId))}>
        <HandOffIcon />
        {intl.formatMessage(messages.lowerHand)}
      </MenuAction>
    ),
    user.emoji && isSelf && (
      <MenuAction key="reaction" type="button" onClick={run(actions.removeOwnReaction)}>
        <CloseIcon />
        {intl.formatMessage(messages.removeReaction)}
      </MenuAction>
    ),
    canChangeLock && (
      <MenuAction
        key="lock"
        type="button"
        onClick={run(() => actions.setLocked(user.userId, !user.locked))}
      >
        {user.locked ? <UnlockIcon /> : <LockIcon />}
        {intl.formatMessage(
          user.locked ? messages.unlockUser : messages.lockUser,
          { userName: user.name },
        )}
      </MenuAction>
    ),
    mod && !user.presenter && (
      <MenuAction key="presenter" type="button" onClick={run(() => actions.makePresenter(user.userId))}>
        <PresenterIcon />
        {intl.formatMessage(messages.makePresenter)}
      </MenuAction>
    ),
    mod && !isSelf && !user.isModerator && (
      <MenuAction key="promote" type="button" onClick={run(() => actions.setRole(user.userId, 'MODERATOR'))}>
        <ShieldIcon />
        {intl.formatMessage(messages.promote)}
      </MenuAction>
    ),
    mod && !isSelf && user.isModerator && (
      <MenuAction key="demote" type="button" onClick={run(() => actions.setRole(user.userId, 'VIEWER'))}>
        <UserIcon />
        {intl.formatMessage(messages.demote)}
      </MenuAction>
    ),
  ].filter(Boolean);

  return (
    <>
      <PopoverHeader>
        <Avatar user={user} small />
        <div style={{ minWidth: 0 }}>
          <PopoverTitle>{user.name}</PopoverTitle>
          <PopoverSubtitle>{statusOf(user, viewer, intl)}</PopoverSubtitle>
        </div>
      </PopoverHeader>
      {items.length > 0 && <MenuList>{items}</MenuList>}
    </>
  );
}

interface UserListMenuProps {
  title: React.ReactNode;
  users: ActivityUser[];
  viewer: Viewer;
  intl: IntlShape;
  actions: Actions;
  // Which bulk action the list offers to moderators
  footer?: 'lowerAllHands' | 'clearReactions';
  // Users that belong in the list but are known only by their number
  more?: number;
  onDone: () => void;
}

// A menu is a glance, not the user list: in a large meeting it names this many
// users at most and closes with the count of the others
const MAX_LISTED = 30;

export function UserListMenu({
  title, users, viewer, intl, actions, footer = undefined, more = 0, onDone,
}: UserListMenuProps) {
  const mod = viewer.isModerator;
  const listed = users.slice(0, MAX_LISTED);
  const notListed = more + users.length - listed.length;
  // A row opens the same menu the user's avatar would, in place of the list
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const selected = users.find((user) => user.userId === selectedId);

  if (selected) {
    return (
      <>
        <BackButton type="button" onClick={() => setSelectedId(null)} aria-label={String(title)}>
          <BackIcon />
          <span>{title}</span>
        </BackButton>
        <UserMenu user={selected} viewer={viewer} intl={intl} actions={actions} onDone={onDone} />
      </>
    );
  }

  return (
    <>
      <PopoverHeader>
        <PopoverTitle>{title}</PopoverTitle>
      </PopoverHeader>
      <UserRows>
        {listed.map((user) => (
          <UserRow key={user.userId} title={statusOf(user, viewer, intl)}>
            <UserRowAvatar>
              <Avatar user={user} small />
              <StatusBadge user={user} single />
            </UserRowAvatar>
            <UserRowName as="button" type="button" onClick={() => setSelectedId(user.userId)}>
              {user.name}
            </UserRowName>
            {user.raiseHand && (mod || user.userId === viewer.userId) && (
              <RowButton
                type="button"
                title={intl.formatMessage(messages.lowerHand)}
                aria-label={`${intl.formatMessage(messages.lowerHand)}: ${user.name}`}
                onClick={() => actions.lowerHand(user.userId)}
              >
                <HandOffIcon />
              </RowButton>
            )}
          </UserRow>
        ))}
        {notListed > 0 && <MoreUsers>{`+${notListed}`}</MoreUsers>}
      </UserRows>
      {mod && footer === 'lowerAllHands' && users.length > 1 && (
        <MenuFooter>
          <MenuAction
            type="button"
            onClick={() => {
              users.filter((u) => u.raiseHand).forEach((u) => actions.lowerHand(u.userId));
              onDone();
            }}
          >
            <HandOffIcon />
            {intl.formatMessage(messages.lowerAllHands)}
          </MenuAction>
        </MenuFooter>
      )}
      {mod && footer === 'clearReactions' && (
        <MenuFooter>
          <MenuAction
            type="button"
            onClick={() => {
              actions.clearReactions();
              onDone();
            }}
          >
            <TrashIcon />
            {intl.formatMessage(messages.clearReactions)}
          </MenuAction>
        </MenuFooter>
      )}
    </>
  );
}

interface WaitingMenuProps {
  users: WaitingUser[];
  intl: IntlShape;
  actions: Actions;
  onDone: () => void;
}

export function WaitingMenu({
  users, intl, actions, onDone,
}: WaitingMenuProps) {
  const everyone = users.map((u) => u.userId);
  return (
    <>
      <PopoverHeader>
        <PopoverTitle>{`${intl.formatMessage(messages.waitingUsers)} (${users.length})`}</PopoverTitle>
      </PopoverHeader>
      <UserRows>
        {users.map((user) => (
          <UserRow key={user.userId}>
            <Avatar user={user} small />
            <UserRowName title={user.name}>{user.name}</UserRowName>
            <RowButton
              type="button"
              $tone="success"
              title={intl.formatMessage(messages.accept)}
              aria-label={`${intl.formatMessage(messages.accept)}: ${user.name}`}
              onClick={() => actions.answerGuests([user.userId], 'ALLOW')}
            >
              <CheckIcon />
            </RowButton>
            <RowButton
              type="button"
              $tone="danger"
              title={intl.formatMessage(messages.deny)}
              aria-label={`${intl.formatMessage(messages.deny)}: ${user.name}`}
              onClick={() => actions.answerGuests([user.userId], 'DENY')}
            >
              <CloseIcon />
            </RowButton>
          </UserRow>
        ))}
      </UserRows>
      <MenuFooter>
        <MenuAction
          type="button"
          $tone="success"
          onClick={() => {
            actions.answerGuests(everyone, 'ALLOW');
            onDone();
          }}
        >
          <AllowAllIcon />
          {intl.formatMessage(messages.allowEveryone, { count: users.length })}
        </MenuAction>
        <MenuAction
          type="button"
          $tone="danger"
          onClick={() => {
            actions.answerGuests(everyone, 'DENY');
            onDone();
          }}
        >
          <CloseIcon />
          {intl.formatMessage(messages.denyEveryone, { count: users.length })}
        </MenuAction>
      </MenuFooter>
    </>
  );
}
