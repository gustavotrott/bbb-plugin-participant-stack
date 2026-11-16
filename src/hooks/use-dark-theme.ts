import { useEffect, useState } from 'react';

/*
 * The client's dark theme is DarkReader. There is no setting to read, so the
 * state is taken from what DarkReader leaves on the page (attributes on <html>
 * and its own <style> elements) and kept current with the `darkmodechange`
 * event the client fires when the user switches.
 */
const isDark = (): boolean => {
  const root = document.documentElement;
  const scheme = root.getAttribute('data-darkreader-scheme');
  if (scheme) return scheme === 'dark';
  return root.hasAttribute('data-darkreader-mode') || document.querySelector('style.darkreader') !== null;
};

export const useDarkTheme = (): boolean => {
  const [dark, setDark] = useState(isDark);

  useEffect(() => {
    const refresh = (event?: Event) => {
      const announced = (event as CustomEvent<{ enabled?: boolean }> | undefined)?.detail?.enabled;
      setDark(typeof announced === 'boolean' ? announced : isDark());
    };
    const observer = new MutationObserver(() => refresh());
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-darkreader-mode', 'data-darkreader-scheme'],
    });
    window.addEventListener('darkmodechange', refresh);
    refresh();
    return () => {
      observer.disconnect();
      window.removeEventListener('darkmodechange', refresh);
    };
  }, []);

  return dark;
};
