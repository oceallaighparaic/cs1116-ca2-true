import { World } from "./modules/world.mjs";
import { g_TILESIZE } from "./modules/level.mjs";

let g_CANVAS;
let g_CONTEXT;

const TARGET_DT = 1000/30; // 1000ms/30frames target
let dt; let last_frame_time = Date.now(); // ms

let g_WORLD;

// init
document.addEventListener("DOMContentLoaded", () => {
    //#region GLOBAL VARIABLES INITIALIZATION
    g_CANVAS = document.querySelector("canvas");
    g_CONTEXT = g_CANVAS.getContext("2d");

    // scale canvas
    g_CANVAS.width = window.innerWidth; 
    g_CANVAS.height = window.innerHeight;
    //#endregion

    g_WORLD = new World();

    draw();
}, false);

function draw() {
    window.requestAnimationFrame(draw);

    //#region TARGET FPS FUNCTIONALITY
    const current_time = Date.now(); // ms
    dt = current_time-last_frame_time;
    if (dt <= TARGET_DT) return;
    /*
        if we draw faster than the target deltatime or
        if our fps is higher than the target fps,
        dont draw this frame - wait until we reach our target frame delta (deltatime/fps)!
    */
    last_frame_time = current_time-(dt%TARGET_DT);
    //#endregion

    g_CONTEXT.clearRect(0,0,g_CANVAS.width,g_CANVAS.height);

    //#region DRAW BACKGROUND
    g_CONTEXT.fillStyle="black";
    g_CONTEXT.fillRect(0,0,g_CANVAS.width,g_CANVAS.height);
    //#endregion

    //#region DRAW LEVEL
    const current_level = g_WORLD.getCurrentLevel();
    let draw_position = {x: 0, y: (g_CANVAS.height/2)-(g_TILESIZE*Math.floor(current_level.floor.length/2))};
    for (let row of g_WORLD.getCurrentLevel().floor) {
        draw_position.x = (g_CANVAS.width/2)-(g_TILESIZE*Math.floor(current_level.floor[0].length/2)); // formula = (center of screen) - (size of tiles)
        for (let t of row) {
            g_CONTEXT.fillStyle = t.color;
            g_CONTEXT.fillRect(draw_position.x, draw_position.y, g_TILESIZE, g_TILESIZE);
            draw_position.x += g_TILESIZE-0.5;
        }
        draw_position.y += g_TILESIZE-0.5;
    }
    //#endregion
}

export { g_CANVAS, g_CONTEXT };