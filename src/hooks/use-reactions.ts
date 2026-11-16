import { PluginApi } from 'bigbluebutton-html-plugin-sdk';
import * as React from 'react';
import { USER_REACTIONS } from '../graphql/queries';
import { UserReaction, UserReactionsResponse } from '../commons/types';

// Reactions last 30s by default; starting a little in the past shows the ones
// already on screen for everybody else when this user joins.
const LOOK_BACK_MS = 15000;
const variables = { initialCursor: new Date(Date.now() - LOOK_BACK_MS).toISOString() };

const timeLeft = (reaction: UserReaction) => new Date(reaction.expiresAt).getTime() - Date.now();

/**
 * Who is reacting right now, oldest reaction first. The stream only tells when a
 * reaction starts (or is cleared: 'none'), so each one is dropped here when the
 * time the server gave it runs out.
 */
export const useReactions = (pluginApi: PluginApi): UserReaction[] => {
  const { data } = pluginApi
    .useCustomSubscription!<UserReactionsResponse>(USER_REACTIONS, { variables }) || {};
  const [reactions, setReactions] = React.useState<Record<string, UserReaction>>({});
  const timers = React.useRef(new Map<string, number>());

  React.useEffect(() => {
    const batch = data?.user_reaction_stream;
    if (!batch?.length) return;

    const remove = (userId: string) => {
      timers.current.delete(userId);
      setReactions((prev) => {
        if (!prev[userId]) return prev;
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    };

    setReactions((prev) => {
      const next = { ...prev };
      batch.forEach((reaction) => {
        const { userId } = reaction;
        window.clearTimeout(timers.current.get(userId));
        timers.current.delete(userId);

        const remaining = timeLeft(reaction);
        if (reaction.reactionEmoji === 'none' || remaining <= 0) {
          delete next[userId];
          return;
        }
        next[userId] = reaction;
        timers.current.set(userId, window.setTimeout(() => remove(userId), remaining));
      });
      return next;
    });
  }, [data]);

  React.useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((id) => window.clearTimeout(id));
      pending.clear();
    };
  }, []);

  return React.useMemo(() => Object.values(reactions).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  ), [reactions]);
};
