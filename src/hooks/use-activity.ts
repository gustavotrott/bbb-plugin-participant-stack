import { PluginApi } from 'bigbluebutton-html-plugin-sdk';
import { useMemo } from 'react';
import {
  GET_GUEST_WAITING_USERS_SUBSCRIPTION,
  RAISED_HAND_USERS,
  USER_AGGREGATE_COUNT_SUBSCRIPTION,
  USER_LIST_SUBSCRIPTION,
  userListFirstPageVariables,
} from '../graphql/queries';
import {
  ActivityUser,
  GuestWaitingUsersResponse,
  RaisedHandUsersResponse,
  StackEntry,
  UserListResponse,
  UsersCountResponse,
  WaitingUser,
} from '../commons/types';
import { useReactions } from './use-reactions';
import { Settings } from '../commons/settings';

export interface Activity {
  presenter?: ActivityUser;
  // In the order the hands were raised
  hands: ActivityUser[];
  // Everyone with an active reaction, oldest first
  reacting: ActivityUser[];
  // The others on the first page of the user list: moderators first, then by name
  others: ActivityUser[];
  // Everyone the stack knows, in the order of the stack
  everyone: ActivityUser[];
  // Users in the meeting, including the ones the stack knows nothing else about
  total: number;
}

// Stable, or the client would see a new subscription on every render
const firstPage = userListFirstPageVariables();

export const useActivity = (pluginApi: PluginApi): Activity => {
  const { data: pageData } = pluginApi.useCustomSubscription!<UserListResponse>(
    USER_LIST_SUBSCRIPTION,
    { variables: firstPage },
  ) || {};
  const { data: countData } = pluginApi
    .useCustomSubscription!<UsersCountResponse>(USER_AGGREGATE_COUNT_SUBSCRIPTION) || {};
  const { data: handsData } = pluginApi
    .useCustomSubscription!<RaisedHandUsersResponse>(RAISED_HAND_USERS) || {};
  const reactions = useReactions(pluginApi);

  return useMemo(() => {
    const users = new Map<string, ActivityUser>();
    const page = (pageData?.user ?? []).filter((u) => !u.bot && !u.loggedOut);

    // What the first page knows about a user, if it is there
    const known = new Map(page.map((u): [string, ActivityUser] => [u.userId, {
      userId: u.userId,
      name: u.name,
      color: u.color,
      avatar: u.avatar || undefined,
      presenter: u.presenter,
      isModerator: u.isModerator,
      locked: u.locked,
      raiseHand: false,
    }]));
    const upsert = (userId: string, fallback: Partial<ActivityUser>): ActivityUser => {
      const user: ActivityUser = users.get(userId) ?? {
        userId,
        name: '',
        color: '',
        presenter: false,
        isModerator: false,
        raiseHand: false,
        ...fallback,
        ...known.get(userId),
      };
      users.set(userId, user);
      return user;
    };

    const presenterId = page.find((u) => u.presenter)?.userId;
    if (presenterId) upsert(presenterId, {});

    const handIds = (handsData?.user ?? []).map((u, index) => {
      const user = upsert(u.userId, {
        name: u.name,
        color: u.color,
        presenter: u.presenter,
        isModerator: u.isModerator,
        locked: u.locked,
      });
      user.raiseHand = true;
      user.handPosition = index + 1;
      return u.userId;
    });

    const reactingIds = reactions.map((reaction) => {
      upsert(reaction.userId, {
        name: reaction.user?.name ?? '',
        color: reaction.user?.color ?? '',
      }).emoji = reaction.reactionEmoji;
      return reaction.userId;
    });

    const others = page
      .filter((u) => !users.has(u.userId))
      .map((u) => known.get(u.userId)!)
      // The page comes sorted by name within each role; the sort is stable
      .sort((a, b) => Number(b.isModerator) - Number(a.isModerator));

    // Same order as the stack: presenter, hands as they were raised, reactions, the rest
    const everyone = Array.from(new Set([
      ...(presenterId ? [presenterId] : []),
      ...handIds,
      ...reactingIds,
    ])).map((id) => users.get(id)!).concat(others);

    return {
      presenter: presenterId ? users.get(presenterId) : undefined,
      hands: handIds.map((id) => users.get(id)!),
      reacting: reactingIds.map((id) => users.get(id)!),
      others,
      everyone,
      total: Math.max(countData?.user_aggregate?.aggregate?.count ?? 0, users.size + others.length),
    };
  }, [pageData, countData, handsData, reactions]);
};

// Mounted only for moderators: viewers have nothing to see in the waiting room.
export const useWaitingUsers = (pluginApi: PluginApi): WaitingUser[] => {
  const { data } = pluginApi.useCustomSubscription!<GuestWaitingUsersResponse>(
    GET_GUEST_WAITING_USERS_SUBSCRIPTION,
  ) || {};
  return useMemo(() => (data?.user_guest ?? []).map((guest) => ({
    userId: guest.userId,
    name: guest.user?.name ?? '',
    color: guest.user?.color ?? '',
    avatar: guest.user?.avatar || undefined,
  })), [data]);
};

const groupByEmoji = (users: ActivityUser[]): Map<string, ActivityUser[]> => {
  const groups = new Map<string, ActivityUser[]>();
  users.forEach((user) => {
    groups.set(user.emoji!, [...(groups.get(user.emoji!) ?? []), user]);
  });
  return groups;
};

/**
 * Turns the activity into what the stack draws, most important first:
 * presenter, raised hands (in the order they were raised), then reactions.
 */
export const buildEntries = (
  activity: Activity,
  settings: Pick<Settings, 'design' | 'showPresenter' | 'showIdleUsers' | 'groupReactionsFrom'>,
  // Whether users with the same reaction become one item. Grouping trades names
  // for room, so the stack asks for it only when it is short of room.
  groupReactions = true,
): StackEntry[] => {
  const {
    presenter, hands, reacting, others,
  } = activity;
  // A presenter that is not singled out is one more user of the meeting
  const idle = settings.showIdleUsers
    ? [...(presenter && !settings.showPresenter ? [presenter] : []), ...others]
    : [];
  const entries: StackEntry[] = [];
  const listed = new Set<string>();
  const addUser = (user: ActivityUser) => {
    if (listed.has(user.userId)) return;
    listed.add(user.userId);
    entries.push({ kind: 'user', key: user.userId, user });
  };

  if (settings.showPresenter && presenter) addUser(presenter);

  if (settings.design === 'summary') {
    if (hands.length) entries.push({ kind: 'hands', key: 'hands', users: hands });
    groupByEmoji(reacting).forEach((users, emoji) => {
      entries.push({
        kind: 'reactions', key: `reactions-${emoji}`, emoji, users,
      });
    });
    idle.forEach(addUser);
    return entries;
  }

  hands.forEach(addUser);

  const groups = groupByEmoji(reacting.filter((user) => !listed.has(user.userId)));
  groups.forEach((users, emoji) => {
    if (groupReactions && users.length >= settings.groupReactionsFrom) {
      entries.push({
        kind: 'reactions', key: `reactions-${emoji}`, emoji, users,
      });
    } else {
      users.forEach(addUser);
    }
  });
  idle.forEach(addUser);
  return entries;
};

const usersIn = (entry: StackEntry) => (entry.kind === 'user' ? [entry.user] : entry.users);

/**
 * Keeps the first entries and closes the stack with one counter.
 *
 * With `everyone`, the counter is the number of users in the meeting and holds
 * them all; it is always there, so it is a steady target and an at-a-glance
 * total. Without, it is a "+N" for the users that did not fit, also the ones the
 * stack knows only by their number, and it is only there when there are any.
 */
export const limitEntries = (
  entries: StackEntry[],
  max: number,
  total: number,
  everyone?: ActivityUser[],
): StackEntry[] => {
  if (everyone) {
    if (total < 2) return entries.slice(0, max);
    return [...entries.slice(0, Math.max(max - 1, 1)), {
      kind: 'overflow', key: 'overflow', users: everyone, count: total, all: true,
    }];
  }

  const listed = new Set(entries.flatMap(usersIn).map((user) => user.userId)).size;
  const unlisted = Math.max(total - listed, 0);
  if (entries.length <= max && unlisted === 0) return entries;

  // The "+N" takes one of the places, unless there is one to spare
  const keep = entries.length < max ? entries.length : Math.max(max - 1, 1);
  const kept = entries.slice(0, keep);
  const users = new Map<string, ActivityUser>();
  entries.slice(keep).flatMap(usersIn).forEach((user) => users.set(user.userId, user));
  return [...kept, {
    kind: 'overflow', key: 'overflow', users: Array.from(users.values()), count: users.size + unlisted,
  }];
};
