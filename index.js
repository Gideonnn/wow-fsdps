const robot = require("robotjs");
const { Hardware, getAllWindows, sleep, GlobalHotkey } = require('keysender');

const win = getAllWindows().find(x => x.title == "World of Warcraft")
const { keyboard, mouse, workwindow } = new Hardware(win.handle);

// Settings
const PIXEL_X = 22;
const PIXEL_Y = 27;
const MIN_PRESS_DELAY = 68;
const MAX_PRESS_DELAY = 121;
const MIN_PRE_PRESS_DELAY = 5;
const MAX_PRE_PRESS_DELAY = 36;

// Colors
const DO_NOTHING = "ffffff";
const GLOBAL_COOLDOWN = "ff0000";
const MORTAL_STRIKE = "00ff00";

// Keybinds
const spells = {
    [DO_NOTHING]: () => {}, // noop,
    [GLOBAL_COOLDOWN]: () => {}, // noop,
    [MORTAL_STRIKE]: () => sendKey("f1"),
}

// Globals
let timer = null;

// Welcome message
console.log('Pow is active, press r to start/stop');

new GlobalHotkey({
    key: 'r',
    action: () => {
        if (timer) {
            console.log('Stop')
            clearInterval(timer);
        } else {
            console.log('Start')
            timer = setInterval(tick, 100);
        }
    }
})

/**
 * Functions
 */

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
        console.log('World of Warcraft window not found');
    }

    if (timer) {
        const pixelColor = readColor(PIXEL_X, PIXEL_Y);
        castSpell(pixelColor);
    }
}

function sendKey() {
    keyboard.sendKey('f1', randBetween(MIN_PRESS_DELAY, MAX_PRESS_DELAY))
}

function castSpell(pixelColor) {
    sleep(randBetween(MIN_PRE_PRESS_DELAY, MAX_PRE_PRESS_DELAY));
    if (spells[pixelColor]) {
        spells[pixelColor]();
    } else {
        console.log(`Warning: could not match pixel color ${pixelColor} to spell`);
    }
}

function randBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}