import * as React from 'react';

const icon = (paths: React.ReactNode) => function Icon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
    >
      {paths}
    </svg>
  );
};

export const PresenterIcon = icon(
  <>
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M8 20h8M12 16v4" />
  </>,
);

// Same crown the flat theme puts on moderators in the user list (Lucide)
export const CrownIcon = icon(
  <>
    <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z" />
    <path d="M5 21h14" />
  </>,
);

export const HandIcon = icon(
  <>
    <path d="M18 11V6a2 2 0 0 0-4 0v5" />
    <path d="M14 10V4a2 2 0 0 0-4 0v6" />
    <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
    <path d="M18 8a2 2 0 0 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-6-2.3l-3.600-3.600a2 2 0 0 1 2.800-2.800L7 15" />
  </>,
);

export const HandOffIcon = icon(
  <>
    <path d="M18 11V6a2 2 0 0 0-4 0v3" />
    <path d="M10 6.500V6a2 2 0 0 0-3.400-1.400" />
    <path d="M6 9v5" />
    <path d="M18 8a2 2 0 0 1 4 0v6c0 1.300-.3 2.500-.9 3.600M17.700 20.700A8 8 0 0 1 14 22h-2c-2.800 0-4.500-.9-6-2.300l-3.600-3.600a2 2 0 0 1 2.800-2.800L7 15" />
    <path d="M3 3l18 18" />
  </>,
);

export const ClockIcon = icon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </>,
);

export const DotsIcon = icon(
  <>
    <circle cx="12" cy="5" r="1.4" fill="currentColor" />
    <circle cx="12" cy="12" r="1.4" fill="currentColor" />
    <circle cx="12" cy="19" r="1.4" fill="currentColor" />
  </>,
);

export const EyeOffIcon = icon(
  <>
    <path d="M3 3l18 18" />
    <path d="M10.600 6.100A9.700 9.700 0 0 1 12 6c5 0 8.500 4 9.500 6a13 13 0 0 1-2.700 3.500M6.300 7.700A13 13 0 0 0 2.500 12c1 2 4.500 6 9.500 6a9.500 9.500 0 0 0 4-.9" />
    <path d="M9.900 9.900a3 3 0 0 0 4.200 4.200" />
  </>,
);

export const InfoIcon = icon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8v.01" />
  </>,
);

export const BackIcon = icon(<path d="M15 5l-7 7 7 7" />);

export const CheckIcon = icon(<path d="M5 12.500l4.500 4.500L19 7.500" />);

export const CloseIcon = icon(<path d="M6 6l12 12M18 6L6 18" />);

export const LockIcon = icon(
  <>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </>,
);

export const UnlockIcon = icon(
  <>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 7.500-2" />
  </>,
);

export const ShieldIcon = icon(<path d="M12 3l7 3v5c0 4.500-3 8.300-7 10-4-1.700-7-5.500-7-10V6l7-3z" />);

export const UserIcon = icon(
  <>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </>,
);

export const TrashIcon = icon(
  <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />,
);

export const AllowAllIcon = icon(
  <>
    <circle cx="9" cy="8" r="4" />
    <path d="M2 21a7 7 0 0 1 12-4.900M16 18l2 2 4-4" />
  </>,
);
