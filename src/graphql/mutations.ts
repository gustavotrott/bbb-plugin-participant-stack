// Same mutations the client's user list and waiting room use.

export const SET_RAISE_HAND = `
  mutation SetRaiseHand($userId: String!, $raiseHand: Boolean!) {
    userSetRaiseHand(
      userId: $userId,
      raiseHand: $raiseHand,
    )
  }
`;

export const SET_PRESENTER = `
  mutation SetPresenter($userId: String!) {
    userSetPresenter(
      userId: $userId,
    )
  }
`;

export const SET_ROLE = `
  mutation SetRole($userId: String!, $role: String!) {
    userSetRole(
      userId: $userId,
      role: $role,
    )
  }
`;

export const SET_LOCKED = `
  mutation SetUserLocked($userId: String!, $locked: Boolean!) {
    userSetLocked(
      userId: $userId,
      locked: $locked,
    )
  }
`;

export const SET_REACTION_EMOJI = `
  mutation SetReactionEmoji($reactionEmoji: String!) {
    userSetReactionEmoji(
      reactionEmoji: $reactionEmoji,
    )
  }
`;

export const CLEAR_ALL_REACTION = `
  mutation ClearAllUsersReaction {
    allUsersClearReaction
  }
`;

export const SUBMIT_APPROVAL_STATUS = `
  mutation SubmitApprovalStatus($guests: [GuestUserApprovalStatus]!) {
    guestUsersSubmitApprovalStatus(
      guests: $guests,
    )
  }
`;
