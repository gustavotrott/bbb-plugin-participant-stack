import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import {
  BbbPluginSdk, FloatingWindow, OptionsDropdownOption, PluginApi,
} from 'bigbluebutton-html-plugin-sdk';
import { messages, useGetInternationalization } from '../commons/intl';
import { applyPreferences, setPreferences, usePreferences } from '../commons/preferences';
import { canSee, useSettings } from '../commons/settings';
import { useMediaQuery } from '../hooks/use-media-query';
import Stack from '../components/stack/component';

interface MainComponentProps {
  pluginUuid: string;
}

function MainComponent({ pluginUuid: uuid }: MainComponentProps): React.ReactElement {
  BbbPluginSdk.initialize(uuid);
  const pluginApi: PluginApi = BbbPluginSdk.getPluginApi(uuid);
  const { settings, loading } = useSettings(pluginApi);
  const { intl } = useGetInternationalization(pluginApi);
  const { data: currentUser } = pluginApi.useCurrentUser!() || {};
  const preferences = usePreferences();

  const serializedSettings = JSON.stringify(settings);
  const { position, positionWithPanelOpen, hidden } = applyPreferences(settings, preferences);
  // Re-evaluated as roles change: a viewer who becomes presenter or moderator gets the stack
  const allowed = !loading && !!currentUser && canSee(settings.visibleTo, {
    isModerator: currentUser.role === 'MODERATOR',
    presenter: currentUser.presenter,
  });
  // Same width at which the stack would give up the bars (see use-anchor)
  const mobile = useMediaQuery('(max-width: 640px)');
  const available = allowed && (settings.showOnMobile || !mobile);
  const shown = available && !hidden;

  // Nothing is mounted, and nothing is subscribed to, for who does not see the stack
  React.useEffect(() => {
    if (!shown) return undefined;
    const movable = position === 'floating';
    // A movable window starts where the docked stack would be: at the start of the nav bar
    const navbar = movable ? document.getElementById('Navbar')?.getBoundingClientRect() : undefined;

    pluginApi.setFloatingWindows([
      new FloatingWindow({
        id: `bbb-plugin-participant-stack-${position}`,
        top: navbar ? navbar.top + 8 : 0,
        left: navbar ? navbar.left + 12 : 0,
        movable,
        backgroundColor: 'transparent',
        boxShadow: 'none',
        // Just above other plugins' floating windows, so its menus are not covered
        zIndex: 801,
        contentFunction(element) {
          // The window itself is only a mount point: the docked stack positions
          // itself (see use-anchor) and must not block what is underneath.
          const container = element;
          container.style.pointerEvents = 'none';
          const root = ReactDOM.createRoot(element);
          root.render(
            <Stack
              pluginApi={pluginApi}
              settings={settings}
              position={position}
              positionWithPanelOpen={positionWithPanelOpen}
            />,
          );
          return root;
        },
      }),
    ]);
    return () => {
      pluginApi.setFloatingWindows([]);
    };
  }, [pluginApi, shown, position, positionWithPanelOpen, serializedSettings]);

  // The way back after hiding the stack: an entry in the client's options menu
  React.useEffect(() => {
    if (!available || !settings.userCanHide || !intl) {
      pluginApi.setOptionsDropdownItems([]);
      return;
    }
    pluginApi.setOptionsDropdownItems([
      new OptionsDropdownOption({
        label: intl.formatMessage(hidden ? messages.show : messages.hide),
        icon: 'user',
        dataTest: 'participantStackToggle',
        onClick: () => setPreferences({ hidden: !hidden }),
      }),
    ]);
  }, [pluginApi, available, hidden, intl, settings.userCanHide]);

  return null;
}

export default MainComponent;
