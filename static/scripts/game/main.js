import { World } from "./modules/world.mjs";
import { g_TILESIZE } from "./modules/level.mjs";
import { array_pop, Vector } from "./utilities.js";
import { Player } from "./modules/entity.mjs";

let g_CANVAS;
let g_CONTEXT;

const TARGET_DT = 1000/45; // 1000ms/45frames target
let g_DT; let last_frame_time = Date.now(); // ms

let g_WORLD;
let g_PLAYER;
let g_KEYS_HELD = [];

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
    g_PLAYER = new Player(
        new Vector(g_CANVAS.width/2,g_CANVAS.height/2), 
        Vector.zero(), 
        new Vector(15,15),
        new Vector(100,100)
    );

    main();
}, false);

function main() {
    window.requestAnimationFrame(main);

    //#region TARGET FPS FUNCTIONALITY
    const current_time = Date.now(); // ms
    g_DT = current_time-last_frame_time;
    if (g_DT <= TARGET_DT) return;
    /*
        if we draw faster than the target deltatime or
        if our fps is higher than the target fps,
        dont draw this frame - wait until we reach our target frame delta (deltatime/fps)!
    */
    last_frame_time = current_time-(g_DT%TARGET_DT);
    //#endregion

    draw();
    process_input();
}

function draw() {
    g_CONTEXT.clearRect(0,0,g_CANVAS.width,g_CANVAS.height);

    //#region BACKGROUND
    g_CONTEXT.fillStyle="black";
    g_CONTEXT.fillRect(0,0,g_CANVAS.width,g_CANVAS.height);
    //#endregion

    //#region LEVEL
    const current_level = g_WORLD.getCurrentLevel();
    let draw_position = new Vector(0, Math.floor((g_CANVAS.height/2)-(g_WORLD.current_level_size.y/2)));
    for (let row of g_WORLD.getCurrentLevel().floor) {
        draw_position.x = Math.floor((g_CANVAS.width/2)-(g_WORLD.current_level_size.x/2)); // Math.floor() snaps to integer pixels, removing the border on tiles
        for (let t of row) {
            g_CONTEXT.fillStyle = t.color;
            g_CONTEXT.fillRect(draw_position.x, draw_position.y, g_TILESIZE, g_TILESIZE);
            draw_position.x += g_TILESIZE;
        }
        draw_position.y += g_TILESIZE;
    }
    //#endregion

    //#region PLAYER
    g_CONTEXT.fillStyle = "yellow";
    g_CONTEXT.fillRect(...g_PLAYER.position.toArray(), ...g_PLAYER.size.toArray()); // unpacking took FOREVERRR to understand
    //#endregion
}
function process_input() {
    g_PLAYER.move_direction = Vector.zero();
    for (const k of g_KEYS_HELD) {
        switch(k) {
            //#region PLAYER MOVEMENT VECTOR
            case "w":
                g_PLAYER.move_direction.y += -1;
                break;
            case "a":
                g_PLAYER.move_direction.x += -1;
                break;
            case "s":
                g_PLAYER.move_direction.y += 1;
                break;
            case "d":
                g_PLAYER.move_direction.x += 1;
                break;
            //#endregion
        }
    }

    //#region PLAYER MOVEMENT
    g_PLAYER.move_direction = Vector.normalize(g_PLAYER.move_direction);
    g_PLAYER.addPosition(Vector.scale(
        Vector.multiply(g_PLAYER.move_direction,g_PLAYER.movespeed),
        g_DT/1000 // convert to seconds
    ));
    //#endregion
}

document.addEventListener("keydown", (event) => {
    let b_found = false;
    for (const k of g_KEYS_HELD)
        if (k === event.key) b_found = true;
    if (!b_found) g_KEYS_HELD.push(event.key);
}, false);
document.addEventListener("keyup", (event) => {
    array_pop(g_KEYS_HELD, event.key);
}, false);

export { g_CANVAS, g_CONTEXT, g_WORLD };