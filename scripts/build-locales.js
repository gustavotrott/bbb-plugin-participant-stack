/* eslint-disable no-console */
/*
 * Generates public/locales/*.json for every language BigBlueButton ships.
 *
 * Almost every string this plugin shows already exists in the BigBlueButton
 * client, translated by its community, so the locale files are assembled from
 * the client's own locale files instead of being translated again. The few
 * strings the client does not have are in scripts/own-translations.js; a
 * language missing there falls back to a close client string, then to English.
 *
 * Usage: node scripts/build-locales.js [path to bigbluebutton-html5/public/locales]
 * Run it again after a BigBlueButton release to pick up new translations.
 */
const fs = require('fs');
const path = require('path');

const SOURCE = process.argv[2]
  || process.env.BBB_LOCALES_DIR
  || path.resolve(__dirname, '../../bigbluebutton/bigbluebutton-html5/public/locales');
const TARGET = path.resolve(__dirname, '../public/locales');
const PREFIX = 'participantStack';

// plugin key -> client key
const FROM_CLIENT = {
  'status.presenter': 'app.userList.presenter',
  'status.moderator': 'app.userList.moderator',
  'status.you': 'app.userList.you',
  'status.locked': 'app.userList.locked',
  'hands.title': 'app.statusNotifier.raisedHandsTitleNotifier',
  'action.lowerHand': 'app.statusNotifier.lowerHandDescOneUser',
  'action.lowerAllHands': 'app.statusNotifier.lowerHands',
  'action.removeReaction': 'app.actionsBar.reactions.removeReactionLabel',
  'action.clearReactions': 'app.userList.userOptions.clearAllReactionsLabel',
  'action.unlockUser': 'app.userList.menu.unlockUser.label',
  'action.lockUser': 'app.userList.menu.lockUser.label',
  'action.makePresenter': 'app.userList.menu.makePresenter.label',
  'action.promote': 'app.userList.menu.promoteUser.label',
  'action.demote': 'app.userList.menu.demoteUser.label',
  'waiting.title': 'app.userList.guest.waitingUsers',
  'waiting.accept': 'app.userList.guest.acceptLabel',
  'waiting.deny': 'app.userList.guest.denyLabel',
  'waiting.allowEveryone': 'app.userList.guest.allowEveryone',
  'waiting.denyEveryone': 'app.userList.guest.denyEveryone',
  'preferences.options': 'app.navBar.optionsDropdown.optionsLabel',
};

// Strings the client does not have: scripts/own-translations.js has them per
// language. `OWN_FALLBACK` names the client string used instead, where there is a
// reasonable one, for a language that file does not cover.
const OWN = require('./own-translations');

const OWN_FALLBACK = {
  'stack.label': 'app.userList.label',
  'status.raisedHand': 'app.statusNotifier.raisedHandsTitleNotifier',
};

const read = (file) => JSON.parse(fs.readFileSync(path.join(SOURCE, file), 'utf8'));

if (!fs.existsSync(SOURCE)) {
  console.error(`BigBlueButton locales not found at ${SOURCE}`);
  process.exit(1);
}

const english = read('en.json');
Object.entries(FROM_CLIENT).forEach(([key, clientKey]) => {
  if (!english[clientKey]) throw new Error(`${clientKey} (for ${key}) is not in the client's en.json`);
});

fs.rmSync(TARGET, { recursive: true, force: true });
fs.mkdirSync(TARGET, { recursive: true });

const files = fs.readdirSync(SOURCE).filter((file) => file.endsWith('.json')).sort();
const written = [];
const report = [];

files.forEach((file) => {
  const locale = file.replace('.json', ''); // client naming, e.g. pt_BR
  const language = locale.split('_')[0];
  const client = read(file);
  const isEnglish = locale === 'en';
  const messages = {};
  let translated = 0;

  // A client string left in English in a translation file is not a translation
  const fromClient = (clientKey) => {
    const value = client[clientKey];
    if (!value) return undefined;
    return (isEnglish || value !== english[clientKey]) ? value : undefined;
  };

  Object.keys(OWN.en).forEach((key) => {
    const value = OWN[locale]?.[key] ?? OWN[language]?.[key]
      ?? (OWN_FALLBACK[key] && fromClient(OWN_FALLBACK[key]));
    if (value) {
      messages[`${PREFIX}.${key}`] = value;
      translated += 1;
    }
  });
  Object.entries(FROM_CLIENT).forEach(([key, clientKey]) => {
    const value = fromClient(clientKey);
    if (value) {
      messages[`${PREFIX}.${key}`] = value;
      translated += 1;
    }
  });

  if (translated === 0) return;
  // The client announces its locale with a hyphen (pt-BR); its files use an underscore
  const target = `${locale.replace('_', '-')}.json`;
  fs.writeFileSync(path.join(TARGET, target), `${JSON.stringify(messages, null, 2)}\n`);
  written.push(target);
  report.push(`${locale}:${translated}`);
});

// The SDK reads this list to find the best file for the user's locale
fs.writeFileSync(
  path.join(TARGET, 'index.json'),
  `${JSON.stringify([...written, 'index.json'].sort(), null, 2)}\n`,
);

const total = Object.keys(FROM_CLIENT).length + Object.keys(OWN.en).length;
console.log(`${written.length} locales written to ${TARGET} (strings translated, of ${total}):`);
console.log(report.join('  '));
