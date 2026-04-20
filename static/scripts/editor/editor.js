import { Canvas, UIManager, UIElement, Text, Button } from "../uimanager.js";
import { g_TILESIZE, Tiles, Level } from "../game/modules/level.mjs";
import { World } from "./modules/world.mjs";
import { Vector, array_pop } from "../utilities.js";

let g_CANVAS;
let g_CONTEXT;
let g_INPUT;

const TARGET_DT = 1000/45; // 1000ms/45frames target
let g_DT; let last_frame_time = Date.now(); // ms

let g_WORLD;
let g_UI;
let g_KEYS_HELD = [];
let g_MOUSE = Vector.zero();
let g_MOUSE_HELD = false;

let g_EXPORTING = false;
let g_SELECTION = Tiles.Grass;

// DEBUG SHORTCUT FOR EDITING
window.load_level_from_console = function (name) {
    console.log(`Loading: ${name}. This will overwrite the current level.`);
    g_WORLD.loadLevel(name);
}

// init
document.addEventListener("DOMContentLoaded", () => {
    //#region GLOBAL VARIABLES INITIALIZATION
    g_CANVAS = document.querySelector("canvas");
    g_CONTEXT = g_CANVAS.getContext("2d");
    g_INPUT = document.querySelector("#level_name");
    g_UI = new UIManager();

    // scale canvas
    g_CANVAS.width = Math.floor(window.innerWidth/g_TILESIZE)*g_TILESIZE; 
    g_CANVAS.height = Math.floor(window.innerHeight/g_TILESIZE)*g_TILESIZE;
    //#endregion

    //#region MOUSE DETECTION
    g_CANVAS.addEventListener("mousedown", () => {
        g_MOUSE_HELD = true;
    }, false);
    g_CANVAS.addEventListener("mouseup", () => {
        g_MOUSE_HELD = false;
    }, false);
    //#endregion

    //#region UI
    // !-- hover
    let hover_canvas = new Canvas("hover_container");
    g_UI.addCanvas(hover_canvas);
    let hover = new UIElement("hover", Vector.zero(), new Vector(g_TILESIZE, g_TILESIZE));
    hover.background_color = "rgba(255,0,255,1)";
    hover_canvas.addChild(hover);

    // !-- tile selection
    let tile_canvas = new Canvas("tile_container");
    g_UI.addCanvas(tile_canvas);
    let background = new UIElement(
        "tile_box", 
        new Vector(g_CANVAS.width-200-50,50),
        new Vector(200, 400)
    );
    background.background_color = "purple"
    tile_canvas.addChild(background);
    let title = new Text("title", "Tiles:", new Vector(background.size.x/2, -5), Vector.zero());
    title.color = "white";
    background.addChild(title);

    const space_between = 10; // px
    const max_column = background.size.x/(g_TILESIZE+(space_between*Math.floor(background.size.x/g_TILESIZE)));
    let column = 0;
    let row = 0;
    for (let t in Tiles) {
        // draw tile
        let pos = new Vector(
            ((g_TILESIZE+space_between/2)*column)+space_between, 
            ((g_TILESIZE+space_between)*row)+space_between
        );
        console.log(pos);
        let tile_ui = new Button(g_CANVAS, t, pos, new Vector(g_TILESIZE, g_TILESIZE), () => {g_SELECTION = Tiles[t];});
        tile_ui.background_color = Tiles[t].color;
        background.addChild(tile_ui);

        // progress tile position
        if (column-1>max_column) {
            column=0;
            row++;
        } else {
            column++;
        }
    }

    // !-- level name input
    g_INPUT.style.left = `50vw`;
    g_INPUT.style.top = `10px`;

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
    let draw_position = Vector.zero();
    draw_position.set(g_WORLD.position);
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
            case "Enter":
                if (!g_EXPORTING) {
                    g_EXPORTING = true;
                    exportLevel();
                }
                break;
        }
    }

    if (g_MOUSE_HELD) {
        const hit = g_WORLD.getTileAt(g_MOUSE);
        g_WORLD.setTile(g_MOUSE, g_KEYS_HELD.includes("Backspace")||g_KEYS_HELD.includes("Delete") ? Tiles.Empty : g_SELECTION);
    }
}

function exportLevel() {
    g_INPUT.style.visibility = "visible";

    if (g_INPUT.value.trim().length === 0) {
        g_INPUT.placeholder = "Enter a level name here.";
        g_EXPORTING = false;
        return;
    }

    //#region CONVERT
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
    //#endregion

    //#region UPLOAD
    let data = new FormData();
    data.append("floor", JSON.stringify(matrix));
    data.append("name", g_INPUT.value);
    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/upload_level");
    xhttp.send(data);
    console.log(`Uploaded ${g_INPUT.value}`);
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
window.addEventListener("mousemove", (event) => {
    const rect = g_CANVAS.getBoundingClientRect();
    g_MOUSE = new Vector(event.clientX-rect.left, event.clientY-rect.top);
}, false);

export { g_CANVAS, g_CONTEXT };