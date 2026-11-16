import * as React from 'react';
import { ActivityUser } from '../../commons/types';
import { CrownIcon, HandIcon, PresenterIcon } from '../../commons/icons';
import { AvatarFace, Badge } from '../stack/styles';

// Same initials as the client's own avatars: the first two characters of the name
export const initialsOf = (name: string) => {
  const chars = Array.from((name ?? '').trim()).slice(0, 2);
  return chars.length ? chars[0].toUpperCase() + (chars[1] ?? '').toLowerCase() : '?';
};

interface AvatarProps {
  user: Pick<ActivityUser, 'name' | 'color' | 'avatar'>;
  small?: boolean;
}

export function Avatar({ user, small = false }: AvatarProps) {
  const [broken, setBroken] = React.useState(false);
  return (
    <AvatarFace
      className="bbb-participant-stack__avatar"
      $small={small}
      style={{ '--pav-avatar-color': user.color } as React.CSSProperties}
    >
      {user.avatar && !broken
        ? <img src={user.avatar} alt="" onError={() => setBroken(true)} />
        : initialsOf(user.name)}
    </AvatarFace>
  );
}

type BadgeKind = 'hand' | 'emoji' | 'presenter' | 'moderator';

interface StatusBadgeProps {
  user: Pick<ActivityUser, 'raiseHand' | 'emoji' | 'presenter' | 'isModerator'>;
  // Only the main badge, for the small avatars of the lists
  single?: boolean;
}

/**
 * Up to two marks on an avatar. The lower corner takes the most actionable
 * state: a raised hand, else a reaction, else the presenter mark. The upper
 * corner takes whatever comes next (a hand and a reaction show together), and
 * otherwise the moderator's crown.
 */
export function StatusBadge({ user, single = false }: StatusBadgeProps) {
  const kinds: BadgeKind[] = [];
  if (user.raiseHand) kinds.push('hand');
  if (user.emoji) kinds.push('emoji');
  if (user.presenter) kinds.push('presenter');
  const [main, second] = kinds;
  const upper = second ?? (user.isModerator ? 'moderator' : undefined);

  const content = (kind: BadgeKind) => {
    if (kind === 'hand') return <HandIcon />;
    if (kind === 'emoji') return user.emoji;
    if (kind === 'presenter') return <PresenterIcon />;
    return <CrownIcon />;
  };
  const badge = (kind: BadgeKind, slot: 'lower' | 'upper') => (
    <Badge
      key={slot}
      className={`bbb-participant-stack__badge bbb-participant-stack__badge--${kind}`}
      $kind={kind}
      $slot={slot}
    >
      {content(kind)}
    </Badge>
  );

  return (
    <>
      {main && badge(main, 'lower')}
      {!single && upper && badge(upper, 'upper')}
    </>
  );
}
