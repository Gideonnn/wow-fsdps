const robot = require('robotjs');
const { Hardware, getAllWindows, sleep, GlobalHotkey } = require('keysender');

const win = getAllWindows().find(x => x.title == 'World of Warcraft');
const { keyboard, mouse, workwindow } = new Hardware(win.handle);

const TICK_INTERVAL_MS = 100;
const PIXEL_X = 20;
const PIXEL_Y = 17;
const PIXEL_GAP = 16;
const PIXELS = [
  'combat',
  'gcd',
  'mounted',
  'pummel',
  'mortalStrike',
  'execute',
  'overpower',
  'rend',
  'heroicStrike',
  'cleave',
  'victoryRush',
  'sweepingStrikes',
  'thunderClap',
  'demoShout',
];

const spells = {
  pummel: {
    name: 'Pummel',
    key: 'q',
    settings: {
      minPressDelay: 62,
      maxPressDelay: 97,
      minGcdDelay: 120,
      maxGcdDelay: 697,
    },
  },
  mortalStrike: {
    name: 'Mortal Strike',
    key: 'f1',
    settings: {
      minPressDelay: 68,
      maxPressDelay: 121,
      minGcdDelay: 2,
      maxGcdDelay: 36,
    },
  },
  execute: {
    name: 'Execute',
    key: 'f6',
    settings: {
      minPressDelay: 48,
      maxPressDelay: 98,
      minGcdDelay: 2,
      maxGcdDelay: 25,
    },
  },
  overpower: {
    name: 'Overpower',
    key: 'f3',
    settings: {
      minPressDelay: 68,
      maxPressDelay: 121,
      minGcdDelay: 2,
      maxGcdDelay: 36,
    },
  },
  rend: {
    name: 'Rend',
    key: 'f5',
    settings: {
      minPressDelay: 60,
      maxPressDelay: 114,
      minGcdDelay: 3,
      maxGcdDelay: 42,
    },
  },
  heroicStrike: {
    name: 'Heroic Strikes',
    key: 'f2',
    settings: {
      minPressDelay: 60,
      maxPressDelay: 99,
      minGcdDelay: 167,
      maxGcdDelay: 250,
    },
  },
  cleave: {
    name: 'Cleave',
    key: 'f8',
    settings: {
      minPressDelay: 57,
      maxPressDelay: 99,
      minGcdDelay: 161,
      maxGcdDelay: 244,
    },
  },
  victoryRush: {
    name: 'Victory Rush',
    key: 'f9',
    settings: {
      minPressDelay: 48,
      maxPressDelay: 98,
      minGcdDelay: 12,
      maxGcdDelay: 35,
    },
  },
  sweepingStrikes: {
    name: 'Sweeping Strikes',
    key: 'f',
    settings: {
      minPressDelay: 48,
      maxPressDelay: 98,
      minGcdDelay: 2,
      maxGcdDelay: 25,
    },
  },
  thunderClap: {
    name: 'Thunder Clap',
    key: 'f7',
    settings: {
      minPressDelay: 38,
      maxPressDelay: 131,
      minGcdDelay: 5,
      maxGcdDelay: 29,
    },
  },
  demoShout: {
    name: 'Demoralizing Shout',
    key: '3',
    settings: {
      minPressDelay: 40,
      maxPressDelay: 75,
      minGcdDelay: 5,
      maxGcdDelay: 123,
    },
  },
};

// Globals
let paused = false;
let lastLog = '';

// Welcome message
log('greet', 'Pow is active, waiting for combat...');
log('settings1', 'Settings:');
log('settings2', `  tick interval: ${TICK_INTERVAL_MS}ms`);
log('settings3', `  pixel location: { x: ${PIXEL_X}, y: ${PIXEL_Y} }`);

// Hoykeys
new GlobalHotkey({
  key: '=',
  action: () => {
    paused = !paused;
    log('paused', `Paused: ${paused}`);
  },
});

setInterval(() => {
  if (!workwindow.isOpen()) {
    log('win_not_found', 'World of Warcraft window not found');
    return;
  }

  if (!workwindow.isForeground()) {
    log('win_not_forground', 'World of Warcraft window not in foreground');
    return;
  }

  if (!paused) {
    const state = readState(PIXEL_X, PIXEL_Y, PIXEL_GAP, PIXELS);
    const { combat, gcd, mounted, pummel, mortalStrike, execute, overpower, rend } = state;
    const { heroicStrike, cleave, victoryRush, sweepingStrikes, thunderClap, demoShout } = state;

    if (combat && !mounted) {
      if (!gcd && pummel) castSpell(spells.pummel);
      if (!gcd && heroicStrike) castSpell(spells.heroicStrike);
      if (!gcd && cleave) castSpell(spells.cleave);
      if (!gcd && sweepingStrikes) castSpell(spells.sweepingStrikes);
      if (!gcd && mortalStrike) castSpell(spells.mortalStrike);
      if (!gcd && execute) castSpell(spells.execute);
      if (!gcd && overpower) castSpell(spells.overpower);
      if (!gcd && victoryRush) castSpell(spells.victoryRush);
      if (!gcd && rend) castSpell(spells.rend);
      if (!gcd && thunderClap) castSpell(spells.thunderClap);
      if (!gcd && demoShout) castSpell(spells.demoShout);
    }
  }
}, TICK_INTERVAL_MS);

/**
 * Functions
 */

function readColor(relX, relY) {
  const view = workwindow.getView();
  return robot.getPixelColor(relX + view.x, relY + view.y);
}

function readState(originX, originY, vertDistance, keys) {
  return keys.reduce((acc, cur, index) => {
    const y = originY + vertDistance * index;
    acc[cur] = readColor(originX, y) === 'ffffff';
    return acc;
  }, {});
}

function moveMouseTo(relX, relY) {
  const view = workwindow.getView();
  robot.moveMouse(relX + view.x, relY + view.y);
}

function castSpell(action) {
  const { name, key, settings } = action;
  const { minPressDelay, maxPressDelay, minGcdDelay, maxGcdDelay } = settings;

  const gcdDelay = randBetween(minGcdDelay, maxGcdDelay);
  const pressDelay = randBetween(minPressDelay, maxPressDelay);

  sleep(gcdDelay); // Pause before casting to account for sloppyness
  log(key, `${name} (kb: '${key}',  keydown: ${pressDelay}ms, sloppy: ${gcdDelay}ms)`);
  keyboard.sendKey(key, pressDelay);
}

function randBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function log(key, message) {
  if (!key || lastLog !== key) {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const time = `${hours}:${minutes}:${seconds}`;
    console.log(`[${time}] ${message}`);
    lastLog = key;
  }
}
