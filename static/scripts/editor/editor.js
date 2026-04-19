import { Canvas, UIManager, UIElement, Text } from "../uimanager.js";
import { g_TILESIZE, Tiles, Level } from "../game/modules/level.mjs";
import { World } from "./modules/world.mjs";
import { Vector, array_pop } from "../utilities.js";

let g_CANVAS;
let g_CONTEXT;

const TARGET_DT = 1000/45; // 1000ms/45frames target
let g_DT; let last_frame_time = Date.now(); // ms

let g_WORLD;
let g_UI;
let g_KEYS_HELD = [];
let g_MOUSE = Vector.zero();

let g_EXPORTING = false;

// init
document.addEventListener("DOMContentLoaded", () => {
    //#region GLOBAL VARIABLES INITIALIZATION
    g_CANVAS = document.querySelector("canvas");
    g_CONTEXT = g_CANVAS.getContext("2d");
    g_UI = new UIManager();

    // scale canvas
    g_CANVAS.width = Math.floor(window.innerWidth/g_TILESIZE)*g_TILESIZE; 
    g_CANVAS.height = Math.floor(window.innerHeight/g_TILESIZE)*g_TILESIZE;
    //#endregion

    //#region UI
    let hover_canvas = new Canvas("hover_container");
    g_UI.addCanvas(hover_canvas);
    let hover = new UIElement("hover", Vector.zero(), new Vector(g_TILESIZE, g_TILESIZE));
    hover.background_color = "rgba(255,0,255,0.5)";
    hover_canvas.addChild(hover);
    //#endregion

    //#region GAME SETUP
    g_WORLD = new World();
    //#endregion

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
    const current_level = g_WORLD.level;
    let draw_position = new Vector(0, (g_CANVAS.height/2)-(g_WORLD.current_level_size.y/2));
    for (let row of g_WORLD.level.floor) {
        draw_position.x = (g_CANVAS.width/2)-(g_WORLD.current_level_size.x/2);
        for (let t of row) {
            g_CONTEXT.fillStyle = t.color;
            g_CONTEXT.fillRect(draw_position.x, draw_position.y, g_TILESIZE, g_TILESIZE);
            draw_position.x += g_TILESIZE;
        }
        draw_position.y += g_TILESIZE;
    }
    //#endregion

    //#region UI
    for (let c of g_UI.canvases) {
        for (let e of c.children) {
            e.draw(g_CONTEXT);
        }
    }
    //#endregion

    //#region HOVER
    const hover_hit = g_WORLD.getTileAt(g_MOUSE);
    let hover_ui = g_UI.getCanvasByName("hover_container").getChildByName("hover");
    hover_ui.position = hover_hit.position;
    hover_ui.visible = hover_hit.tile !== Tiles.None;
    //#endregion
}
function process_input() {
    for (const k of g_KEYS_HELD) {
        switch(k) {
            case "q":
                const hit = g_WORLD.getTileAt(g_MOUSE);
                if (hit.tile !== Tiles.None) {
                    g_WORLD.setTile(g_MOUSE, Tiles.Grass);
                }
                break;
            case "Enter":
                if (!g_EXPORTING) {
                    g_EXPORTING = true;
                    exportLevel();
                }
                break;
        }
    }
}

function exportLevel() {
    // converts Tiles enum objects into the name of the Tiles enum property (name of tile) to save space
    function get_tile(t) {
        for (let k of Object.keys(Tiles)) {
            if (JSON.stringify(Tiles[k]) === JSON.stringify(t)) {
                return k;
            }
        }
        return "None";
    }

    let matrix = [];
    for (let r of g_WORLD.level.floor) {
        let row = [];
        for (let tile of r) {
            row.push(get_tile(tile));
        } 
        matrix.push(row);
    }

    let data = new FormData();
    data.append("floor", JSON.stringify(matrix));
    data.append("name", "test");
    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/upload_level");
    xhttp.send(data);
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
window.addEventListener("mousemove", (event) => {
    const rect = g_CANVAS.getBoundingClientRect();
    g_MOUSE = new Vector(event.clientX-rect.left, event.clientY-rect.top);
}, false);

export { g_CANVAS, g_CONTEXT };