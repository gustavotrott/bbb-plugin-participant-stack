/*
 * The client keeps one live subscription per distinct query + variables and
 * shares it between everything that asks for it (useDeduplicatedSubscription).
 * Plugin subscriptions go through the same store, and graphql-tag caches parsed
 * documents by their source with whitespace and commas collapsed.
 *
 * So the first two queries below are copied from the client on purpose, operation
 * name and field order included: the client already runs both for its own UI, and
 * this plugin reads the same stream instead of opening a second one. If you edit
 * them, they stop being shared (they still work).
 */

// bigbluebutton-html5/imports/ui/core/graphql/queries/users.ts (RAISED_HAND_USERS)
export const RAISED_HAND_USERS = `
subscription RaisedHandUsers {
  user(
    where: {
      raiseHand: {_eq: true}
    },
    order_by: [
      {raiseHandTime: asc_nulls_last},
    ]) {
    meetingId
    userId
    name
    color
    presenter
    isModerator
    raiseHand
    raiseHandTime
    whiteboardWriteAccess
    voice {
      joined
      listenOnly
      deafened
    }
    locked
  }
}`;

// bigbluebutton-html5/imports/ui/components/user-list/guest-management/waiting-users/queries.ts
export const GET_GUEST_WAITING_USERS_SUBSCRIPTION = `
  subscription getGuestWaitingUsers {
    user_guest(where: {isWaiting: {_eq: true}}, order_by: {positionInWaitingQueue: asc}) {
      guestLobbyMessage
      isAllowed
      isDenied
      userId
      user {
        authed
        userId
        name
        color
        role
        avatar
      }
    }
  }
`;

/*
 * The first page of the client's user list, for the users with nothing going on.
 * bigbluebutton-html5/imports/ui/core/graphql/queries/users.ts (USER_LIST_SUBSCRIPTION),
 * field for field even though the stack reads only a few of them: an identical
 * query is what lets the server evaluate it once for many users, and the client
 * reuse it when its own user list is open.
 *
 * The client asks for it as a "patched" subscription: the Patched_ prefix makes
 * the middleware send JSON patches after the first result, and the client's
 * subscription store applies them. Hence the prefix here too.
 */
export const USER_LIST_SUBSCRIPTION = `
subscription Patched_UserListSubscription($offset: Int!, $limit: Int!, $where: user_bool_exp) {
  user(limit:$limit, offset: $offset,
                where: $where,
                order_by: [
                  { bot: asc },
                  {presenter: desc},
                  {role: asc},
                  {isDialIn: desc},
                  {whiteboardWriteAccess: desc},
                  {nameSortable: asc},
                  {registeredAt: asc},
                  {userId: asc}
                ]) {
    isDialIn
    userId
    meetingId
    extId
    name
    isModerator
    role
    color
    avatar
    away
    raiseHand
    reactionEmoji
    avatar
    presenter
    pinned
    locked
    authed
    mobile
    guest
    bot
    clientType
    disconnected
    loggedOut
    voice {
      joined
      deafened
      listenOnly
      voiceUserId
      listenOnlyInputDevice
    }
    cameras {
      streamId
    }
    whiteboardWriteAccess
    lastBreakoutRoom {
      isDefaultName
      sequence
      shortName
      isUserCurrentlyInRoom
    }
    userLockSettings {
      disablePublicChat
    }
  }
}`;

interface ClientSettingsWindow {
  meetingClientSettings?: { public?: { layout?: { usersPerUserListPage?: number } } };
}

// Same variables, in the same order, as the client's first page with no search:
// getUsersPerUserListPage() and makeUserSearchWhere('') in user-list/service.js
export const userListFirstPageVariables = () => ({
  offset: 0,
  limit: (window as ClientSettingsWindow).meetingClientSettings?.public?.layout
    ?.usersPerUserListPage || 50,
  where: { name: { _ilike: '%' } },
});

// bigbluebutton-html5/imports/ui/core/graphql/queries/users.ts (USER_AGGREGATE_COUNT_SUBSCRIPTION).
// The client always has it open, for the number on its "People" button.
export const USER_AGGREGATE_COUNT_SUBSCRIPTION = `
  subscription UsersCount {
    user_aggregate {
      aggregate {
        count
      }
    }
  }
`;

// Reactions as a stream: each one is sent once, instead of the list of who is
// reacting being sent again on every change. Same text as bbb-plugin-reaction-stack,
// so the server sees one query for both plugins.
export const USER_REACTIONS = `
  subscription UserReactions($initialCursor: timestamptz) {
    user_reaction_stream(
      batch_size: 10,
      cursor: { initial_value: { createdAt: $initialCursor } },
    ) {
      createdAt
      expiresAt
      reactionEmoji
      userId
      user {
        name
        color
      }
    }
  }
`;
