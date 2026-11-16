import * as React from 'react';
import { TITLE_SELECTOR } from './use-anchor';

const STYLE_ID = 'bbb-plugin-participant-stack-title';

const titleElement = () => document.querySelector<HTMLElement>(TITLE_SELECTOR);

/**
 * While the stack sits where the meeting title is, the client's own title is
 * hidden with CSS (not removed: it keeps its place and its behavior) and the
 * plugin redraws it elsewhere. Clicking the redrawn title clicks the original,
 * so it still opens the session details.
 */
export const useMeetingTitle = (active: boolean): { title: string; openDetails: () => void } => {
  const [title, setTitle] = React.useState('');

  React.useEffect(() => {
    if (!active) return undefined;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #Navbar #presentationTitle,
      #Navbar [data-test="presentationTitle"],
      #Navbar button:has(#presentationTitle) {
        visibility: hidden !important;
        pointer-events: none !important;
      }`;
    document.head.appendChild(style);

    const read = () => setTitle(titleElement()?.textContent?.trim() ?? '');
    read();
    // The name changes when the user moves between the meeting and a breakout room
    const interval = window.setInterval(read, 2000);
    return () => {
      window.clearInterval(interval);
      style.remove();
    };
  }, [active]);

  const openDetails = React.useCallback(() => {
    const element = titleElement();
    (element?.closest('button') ?? element?.querySelector('button') ?? element)?.click();
  }, []);

  return { title: active ? title : '', openDetails };
};
