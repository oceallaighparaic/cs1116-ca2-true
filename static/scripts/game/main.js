import { World } from "./modules/world.mjs";
import { Tiles, g_TILESIZE } from "./modules/level.mjs";
import { array_pop, Vector } from "../utilities.js";
import { Player, Dasher, Zombie, Skeleton } from "./modules/entity.mjs";
import { UIManager, Canvas, UIElement, Text } from "../uimanager.js";

let g_CANVAS;
let g_CONTEXT;

const TARGET_DT = 1000/45; // 1000ms/45frames target
let g_DT; let last_frame_time = Date.now(); // ms

let g_WORLD;
let g_UI;
let g_PLAYER;
let g_KEYS_HELD = [];
let g_MOUSE = Vector.zero();
let g_MOUSE_HELD = false;

let g_INTERACTING = false;
let g_INTERACT_HIT; // this variable is only global because im afraid of running isNearTile() twice per frame even tho its not that intensive

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

    //#region MOUSE DETECTION
    g_CANVAS.addEventListener("mousedown", () => {g_MOUSE_HELD = true; g_PLAYER.attack()}, false);
    g_CANVAS.addEventListener("mouseup", () => {g_MOUSE_HELD = false;}, false);
    //#endregion

    //#region GAME SETUP
    g_WORLD = new World();
    g_PLAYER = new Player(
        Vector.scale(g_WORLD.current_level_size, 1/2), 
        Vector.zero(), 
        new Vector(15,15),
        new Vector(100,100)
    );
    g_WORLD.loadLevel("menu", true);
    g_WORLD.loadLevel("level0");
    g_WORLD.spawnEnemy(new Zombie(
        new Vector(300,50),
        Vector.zero(),
        new Vector(20,20),
        new Vector(2,2)
    ));
    //#endregion

    //#region BASIC UI
    let game_ui = new Canvas("game");
    g_UI.addCanvas(game_ui);
    let interact = new UIElement("interact_container", Vector.zero(), new Vector(30,20));
    interact.background_color = "rgba(0,0,0,0.4)";
    game_ui.addChild(interact);
    let txt = new Text("interact", "F",  new Vector(interact.size.x/2, (interact.size.y/2)+5), Vector.zero());
    txt.color = "white";
    txt.font_size = 15;
    interact.addChild(txt);
    //#endregion

    main();
}, false);
// DEBUG SHORTCUT FOR EDITING
window.load_level_from_console = function (name) {
    console.log(`Loading: ${name}. This will overwrite the current level.`);
    g_WORLD.loadLevel(name, true);
}

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

    for (let e of g_WORLD.ENEMIES) {
        e.update();
    }
    if (g_PLAYER.iframes>0) g_PLAYER.iframes--;
}
function draw() {
    g_CONTEXT.clearRect(0,0,g_CANVAS.width,g_CANVAS.height);

    //#region BACKGROUND
    g_CONTEXT.fillStyle="black";
    g_CONTEXT.fillRect(0,0,g_CANVAS.width,g_CANVAS.height);
    //#endregion

    //#region LEVEL
    const current_level = g_WORLD.getCurrentLevel();
    let draw_position = new Vector(0, g_WORLD.position.y);
    for (let row of g_WORLD.getCurrentLevel().floor) {
        draw_position.x = g_WORLD.position.x;
        for (let t of row) {
            g_CONTEXT.fillStyle = Tiles[t].color;
            g_CONTEXT.fillRect(draw_position.x, draw_position.y, g_TILESIZE, g_TILESIZE);
            draw_position.x += g_TILESIZE;
        }
        draw_position.y += g_TILESIZE;
    }
    //#endregion

    //#region ENEMIES
    for (let e of g_WORLD.ENEMIES) {
        if (e.type === "Dasher") {
            // choreograph of dash
            g_CONTEXT.beginPath();
            g_CONTEXT.moveTo(...e.position.toArray());
            if (!e.b_moving) g_CONTEXT.lineTo(...Vector.add(e.position, Vector.scale(Vector.normalize(Vector.subtract(g_PLAYER.position, e.position)),100)).toArray());
            g_CONTEXT.strokeStyle = "red";
            g_CONTEXT.lineWidth = 2;
            g_CONTEXT.stroke();
        }

        g_CONTEXT.fillStyle = e.color;
        g_CONTEXT.fillRect(...e.position.toArray(), ...e.size.toArray());
    }
    //#endregion

    //#region PLAYER
    g_CONTEXT.fillStyle = "rgba(255,140,0,1)";
    if (g_PLAYER.iframes>0) g_CONTEXT.fillStyle = "yellow"; // iframe indicator
    g_CONTEXT.fillRect(...g_PLAYER.position.toArray(), ...g_PLAYER.size.toArray()); // unpacking took FOREVERRR to understand
    //#endregion

    //#region UI
    // !-- interact ui + update
    g_INTERACT_HIT = g_WORLD.isNearTile(g_PLAYER.position, ["Door"], 2);
    let interact_ui = g_UI.getCanvasByName("game").getChildByName("interact_container");
    if (g_INTERACT_HIT.is_near) {
        interact_ui.visible = true;
        interact_ui.position = Vector.add(g_INTERACT_HIT.position, new Vector(g_TILESIZE/2, g_TILESIZE/2));
    } else {
        interact_ui.visible = false;
    }

    for (let c of g_UI.canvases) {
        for (let e of c.children) {
            e.draw(g_CONTEXT);
        }
    }
    //#endregion
}
function process_input() {
    g_PLAYER.move_direction = Vector.zero();
    let b_interact_found = false;
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
            case "f":
                b_interact_found = true;
                if (!g_INTERACTING && g_INTERACT_HIT.is_near) Tiles[g_INTERACT_HIT.tile].interact(g_WORLD, {Dasher: Dasher, Skeleton: Skeleton, Zombie: Zombie});
                break;
            case " ":
                if (g_PLAYER.dashframes<=0) g_PLAYER.dash();
                break;
        }
    }
    g_INTERACTING = b_interact_found;

    //#region PLAYER MOVEMENT
    if (g_PLAYER.dashframes>0) g_PLAYER.dash();
    if (g_PLAYER.dashframes<=0) {
        g_PLAYER.dashcooldown -= 1/g_DT;
        g_PLAYER.move_direction = Vector.normalize(g_PLAYER.move_direction);
        g_PLAYER.addPosition(Vector.scale(
            Vector.multiply(g_PLAYER.move_direction,g_PLAYER.movespeed),
            g_DT/1000 // convert to seconds
        ));
    }
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

export { g_PLAYER, g_CANVAS, g_CONTEXT, g_WORLD, g_DT, g_MOUSE };