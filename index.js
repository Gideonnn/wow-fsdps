const robot = require("robotjs");
const { Hardware, getAllWindows, sleep, GlobalHotkey } = require('keysender');

const win = getAllWindows().find(x => x.title == "World of Warcraft")
const { keyboard, mouse, workwindow } = new Hardware(win.handle);

// Settings
const PIXEL_X = 22;
const PIXEL_Y = 27;
const TICK_INTERVAL_MS = 100;

// Colors
const DO_NOTHING = "ffffff";
const WAIT = "000000";
const REND = "800000";
const MORTAL_STRIKE = "0000ff";
const EXECUTE = "ff0000";
const OVERPOWER = "c0c0c0";
const BATTLE_SHOUT = "808000";
const SWEEPING_STRIKES = "800080";

// Actions
const actions = {
    [DO_NOTHING]: {
        kind: 'message',
        message: 'Nothing to do, waiting...'
    },
    [WAIT]: {
        kind: 'message',
        message: 'Wait conditions met, waiting...'
    },
    [MORTAL_STRIKE]: {
        kind: 'spell',
        name: 'Mortal Strike',
        key: 'f1',
        settings: {
            minPressDelay: 68,
            maxPressDelay: 121,
            minGcdDelay: 2,
            maxGcdDelay: 36,
        }
    },
    [EXECUTE]: {
        kind: 'spell',
        name: 'Execute',
        key: 'f6',
        settings: {
            minPressDelay: 48,
            maxPressDelay: 98,
            minGcdDelay: 2,
            maxGcdDelay: 25,
        }
    },
    [REND]: {
        kind: 'spell',
        name: 'Rend',
        key: 'f5',
        settings: {
            minPressDelay: 60,
            maxPressDelay: 114,
            minGcdDelay: 3,
            maxGcdDelay: 42,
        }
    },
    [OVERPOWER]: {
        kind: 'spell',
        name: 'Overpower',
        key: 'f3',
        settings: {
            minPressDelay: 68,
            maxPressDelay: 121,
            minGcdDelay: 2,
            maxGcdDelay: 36,
        }
    },
    [BATTLE_SHOUT]: {
        kind: 'spell',
        name: 'Battle Shout',
        key: 'z',
        settings: {
            minPressDelay: 63,
            maxPressDelay: 190,
            minGcdDelay: 20,
            maxGcdDelay: 200,
        }
    },
    [SWEEPING_STRIKES]: {
        kind: 'spell',
        name: 'Sweeping Strikes',
        key: 'f',
        settings: {
            minPressDelay: 48,
            maxPressDelay: 98,
            minGcdDelay: 2,
            maxGcdDelay: 25,
        }
    },
};

// Globals
let timer = null;
let lastLog = '';

// Welcome message
log('greet', 'Pow is active, waiting for combat...');
log('settings1', 'Settings:');
log('settings2', `  tick interval: ${TICK_INTERVAL_MS}ms`);
log('settings3', `  pixel location: { x: ${PIXEL_X}, y: ${PIXEL_Y} }`);

// Start
timer = setInterval(tick, TICK_INTERVAL_MS);

// new GlobalHotkey({
//     key: 'r',
//     action: () => togglePause()
// })

/**
 * Functions
 */

function togglePause() {
    if (timer) {
        log('stop_timer', 'Pause');
        clearInterval(timer);
    } else {
        log('start_timer', 'Resume');
        timer = setInterval(tick, TICK_INTERVAL_MS);
    }
}

function readColor(relX, relY) {
    const view = workwindow.getView();
    return robot.getPixelColor(relX + view.x, relY + view.y);
}

function moveMouseTo(relX, relY) {
    const view = workwindow.getView();
    robot.moveMouse(relX + view.x, relY + view.y);
}

function tick() {
    if (!workwindow.isOpen()) {
        log('win_not_found', 'World of Warcraft window not found');
    }

    if (workwindow.isForeground()) {
        const pixelColor = readColor(PIXEL_X, PIXEL_Y);
        const action = actions[pixelColor];

        if (!action) {
            log(`color_not_found_${pixelColor}`, `Color ${pixelColor} has no defined action`);
            return;
        }

        if (action.kind === "spell") {
            castSpell(action);
        } else if (action.kind === "message") {
            log(action.kind, action.message);
        } else {
            throw new Error('This should not be reachable')
        }
    }
}

function castSpell(action) {
    const { name, key, settings } = action;
    const { minPressDelay, maxPressDelay, minGcdDelay, maxGcdDelay } = settings;

    const gcdDelay = randBetween(minGcdDelay, maxGcdDelay);
    const pressDelay = randBetween(minPressDelay, maxPressDelay);
    
    sleep(gcdDelay); // Pause before casting to account for sloppyness
    keyboard.sendKey(key, pressDelay);
    log(key, `${name} (kb: '${key}',  keydown: ${pressDelay}ms, sloppy: ${gcdDelay}ms)`);
}

function randBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function log(key, message) {
    if (lastLog !== key) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const time = `${hours}:${minutes}:${seconds}`;   
        console.log(`[${time}] ${message}`);
        lastLog = key;
    }
}