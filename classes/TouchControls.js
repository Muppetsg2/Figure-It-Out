// AUTHOR: Marceli Antosik (Muppetsg2)


// Touch controls for phones / tablets.
//
//  - swipe LEFT / RIGHT  -> move the player
//  - swipe UP            -> next shape      (box -> circle -> triangle -> box)
//  - swipe DOWN          -> previous shape  (box -> triangle -> circle -> box)
//  - TAP                 -> next shape
//  - pause button (top right corner) -> pause
//  - start screen: tap to start, pause screen: tap to resume / RESTART button,
//    game over screen: tap to restart
//
// A swipe fires as soon as the finger travels SWIPE_THRESHOLD pixels (it does not
// wait for the finger to be lifted), so it is as fast as a key press.
// Every touch is tracked separately, so playing with two thumbs works too.
//
// Must be loaded AFTER GameManager.js (uses its globals and functions).

const SWIPE_THRESHOLD = 30; // px - distance after which a movement counts as a swipe
const TAP_MAX_MOVE = 12;    // px - max finger movement for a tap
const TAP_MAX_TIME = 300;   // ms - max duration of a tap (in game)
const END_TAP_DELAY = 700;  // ms - ignore taps right after game over (player was still swiping)

const activeTouches = new Map();

// ---------- touch / keyboard UI switching ----------

function setTouchUI(enabled) {
    document.documentElement.classList.toggle("touch", enabled);
}

// Initial guess: primary pointer is a finger -> phone / tablet
setTouchUI(window.matchMedia !== undefined && window.matchMedia("(pointer: coarse)").matches);

// Real input decides: touching the screen shows touch tutorials,
// pressing a key (e.g. tablet with keyboard) shows keyboard tutorials.
document.addEventListener("keydown", () => setTouchUI(false), true);

// ---------- helpers ----------

function isInside(target, selector) {
    return target && target.closest && target.closest(selector) !== null;
}

function isPlaying() {
    return start && !end && !pause;
}

function handleSwipe(dx, dy) {
    if (!isPlaying()) return;

    if (Math.abs(dx) > Math.abs(dy)) {
        player.move(dx > 0 ? "right" : "left");
    }
    else if (dy < 0) {
        player.nextShape();
    }
    else {
        player.previousShape();
    }
}

// ---------- touch events ----------

document.addEventListener("touchstart", (event) => {
    // Cancelling touchstart stops ALL browser gestures for this touch:
    // double-tap zoom, pinch zoom, scrolling, long-press menu, emulated mouse clicks.
    // (touchend still fires, so starting the music on touchend keeps working)
    event.preventDefault();
    window.focus(); // keep keyboard/visibility focus inside the game (also when embedded in index.html)

    setTouchUI(true);

    for (const touch of event.changedTouches) {
        const info = {
            x: touch.clientX,
            y: touch.clientY,
            time: Date.now(),
            handled: false, // true when this touch already triggered an action
            moved: 0        // max distance travelled from the start point
        };

        // Pause button reacts immediately on touch down
        if (isPlaying() && isInside(touch.target, "#pause_btn")) {
            onPause();
            info.handled = true;
        }

        activeTouches.set(touch.identifier, info);
    }
}, { passive: false });

document.addEventListener("touchmove", (event) => {
    event.preventDefault(); // no scrolling / zooming / pull-to-refresh

    for (const touch of event.changedTouches) {
        const info = activeTouches.get(touch.identifier);
        if (!info) continue;

        const dx = touch.clientX - info.x;
        const dy = touch.clientY - info.y;
        info.moved = Math.max(info.moved, Math.hypot(dx, dy));

        if (info.handled) continue;

        if (Math.max(Math.abs(dx), Math.abs(dy)) >= SWIPE_THRESHOLD) {
            info.handled = true; // one action per swipe
            handleSwipe(dx, dy);
        }
    }
}, { passive: false });

document.addEventListener("touchend", (event) => {
    event.preventDefault(); // no emulated mouse clicks / double-tap zoom

    for (const touch of event.changedTouches) {
        const info = activeTouches.get(touch.identifier);
        activeTouches.delete(touch.identifier);
        if (!info) continue;

        const moved = Math.max(info.moved, Math.hypot(touch.clientX - info.x, touch.clientY - info.y));
        const isTap = moved <= TAP_MAX_MOVE;

        if (!start) {
            // touchend counts as a user gesture, so the music can start here
            startGame();
        }
        else if (end) {
            if (isTap && Date.now() - endTime > END_TAP_DELAY) {
                restartGame();
            }
        }
        else if (pause) {
            if (info.handled || !isTap) continue;
            if (isZoomed()) continue; // zoom out first (see bottom of this file)

            if (isInside(touch.target, "#pause_restart_btn")) {
                restartGame();
            }
            else {
                onPauseEnd();
            }
        }
        else if (!info.handled && isTap && Date.now() - info.time <= TAP_MAX_TIME) {
            player.nextShape();
        }
    }
}, { passive: false });

document.addEventListener("touchcancel", (event) => {
    for (const touch of event.changedTouches) {
        activeTouches.delete(touch.identifier);
    }
});

// ---------- block zooming ----------

// iOS Safari: pinch zoom (non-standard gesture events)
for (const type of ["gesturestart", "gesturechange", "gestureend"]) {
    document.addEventListener(type, (event) => event.preventDefault(), { passive: false });
}

// Fallback: double-tap / double-click zoom
document.addEventListener("dblclick", (event) => event.preventDefault(), { passive: false });

// ---------- browsers that force zooming (Samsung Internet) ----------
// Samsung Internet has a "Manual zoom" accessibility setting (ON by default) that
// overrides every way a page can block zooming. A page cannot turn it off, so instead:
//  - the game pauses as soon as the view gets zoomed in,
//  - it cannot be resumed until the view is zoomed back out (double-tap or pinch).

const gameViewport = (() => {
    try {
        // when embedded in index.html the zoom happens on the top page
        return window.top.visualViewport || window.visualViewport;
    }
    catch (e) {
        return window.visualViewport;
    }
})();
const baseScale = gameViewport ? gameViewport.scale : 1;

function isZoomed() {
    return gameViewport !== undefined && gameViewport !== null && gameViewport.scale > baseScale * 1.05;
}

if (gameViewport) {
    gameViewport.addEventListener("resize", () => {
        if (isZoomed() && isPlaying()) {
            onPause();
        }
    });
}
