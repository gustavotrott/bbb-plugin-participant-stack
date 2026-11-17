export interface ActivityUser {
  userId: string;
  name: string;
  color: string;
  avatar?: string;
  presenter: boolean;
  isModerator: boolean;
  // Unknown for users this plugin only knows from the basic user info
  locked?: boolean;
  raiseHand: boolean;
  emoji?: string;
}

export type StackEntry =
  | { kind: 'user'; key: string; user: ActivityUser }
  | { kind: 'hands'; key: string; users: ActivityUser[] }
  | { kind: 'reactions'; key: string; emoji: string; users: ActivityUser[] }
  // `count` is everyone not shown; `users` are the ones of them the stack knows
  // With `all`, the item stands for the whole meeting instead of the users not shown
  | { kind: 'overflow'; key: string; users: ActivityUser[]; count: number; all?: boolean };

export interface WaitingUser {
  userId: string;
  name: string;
  color: string;
  avatar?: string;
}

export interface RaisedHandUsersResponse {
  user: {
    userId: string;
    name: string;
    color: string;
    presenter: boolean;
    isModerator: boolean;
    locked: boolean;
  }[];
}

export interface UserListResponse {
  user: {
    userId: string;
    name: string;
    color: string;
    avatar: string;
    presenter: boolean;
    isModerator: boolean;
    locked: boolean;
    bot: boolean;
    loggedOut: boolean;
  }[];
}

export interface UsersCountResponse {
  user_aggregate: { aggregate: { count: number } };
}

export interface UserReaction {
  userId: string;
  reactionEmoji: string;
  createdAt: string;
  expiresAt: string;
  user?: { name: string; color: string };
}

export interface UserReactionsResponse {
  user_reaction_stream: UserReaction[];
}

export interface GuestWaitingUsersResponse {
  user_guest: {
    userId: string;
    user: {
      userId: string;
      name: string;
      color: string;
      avatar: string;
    };
  }[];
}

export interface Viewer {
  userId: string;
  isModerator: boolean;
  hasActiveLockSetting: boolean;
}
