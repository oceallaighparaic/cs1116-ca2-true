import { g_CANVAS } from "../main.js";
import { Level, Tiles, g_TILESIZE } from "./level.mjs";
import { Vector, array_pop } from "../../utilities.js";

/**
 * A World singleton created in `init()`. 
 * Accessed through the WORLD global variable.
 * 
 * Properties:
 * - `current_level` -> The current level name 
 *      + **Default: base, menu**
 * - `LEVELS` -> A list of `Level` instances
 * - `current_level_size` -> A `Vector` of the pixel size of the current floor
 * - `ENEMIES` -> A list of `Enemy` instances
 * 
 * Methods:
 * - `getCurrentLevel()` -> Returns the current `Level` instance
 * - `getTileAt()` -> Returns a tile enum at the `Vector` location and a position of the top left corner of the tile
 * - `changeLevel()` -> Changes the current level to another level that is loaded based on the id
 * - `loadLevel()` -> Loads a level from the `level` DB table and adds it to `World.LEVELS`
 * - `isNearTile()` -> Returns if the position is near some tiles depending on the range, and what the tile is
 * - `spawnEnemy()` -> Adds an `Enemy` to the `World.ENEMIES` array given an instance
 */ 
class World {
    constructor() {
        this.LEVELS = [];
        this.LEVELS.push(new Level("base",25,25));// generate basic level0 fallback
        this.current_level = "base";
        this.current_level_size = this.#calc_level_size();
        this.ENEMIES = [];
    }

    getCurrentLevel() {
        for (let l of this.LEVELS) {
            if (l.name === this.current_level) {
                return l
            }
        }
        console.log("Unable to find level.");
        return null;
    }

    getTileAt(check) {
        const level = this.getCurrentLevel();

        const top_left = new Vector(
            g_CANVAS.width/2-this.current_level_size.x/2,
            g_CANVAS.height/2-this.current_level_size.y/2
        )
        const relative = Vector.subtract(check, top_left);

        const matrix_pos = new Vector(
            Math.floor(relative.x/g_TILESIZE), // px to matrix position
            Math.floor(relative.y/g_TILESIZE) // px to matrix position
        );

        //#region RETURN VALUES
        let ret = {
            tile: "None",
            position: Vector.add(Vector.scale(matrix_pos,g_TILESIZE), top_left), // reverse the process but this will go to the top left as we are working with matrix positions
        };
        if (!((matrix_pos.x<0 || matrix_pos.x>=level.floor[0].length) || (matrix_pos.y<0 || matrix_pos.y>=level.floor.length))) {
            // inside the bounds of map
            ret.tile = level.floor[matrix_pos.y][matrix_pos.x]
        }
        //#endregion

        return ret;
    }

    changeLevel(name) {
        let b_found_level = false;
        for (let l of this.LEVELS) {
            if (l.name === name) {
                this.current_level = name;
                b_found_level = true;
                this.current_level_size = this.#calc_level_size();
            }
        }
        if (!b_found_level) console.log(`Unable to find level ${name}.`);
    }

    loadLevel(name, b_switch_to=false) {
        let data = new FormData();
        data.append("name", name);
        let xhttp = new XMLHttpRequest();
        xhttp.open("POST", "/load_level")
        xhttp.addEventListener("readystatechange", () => {
            if(xhttp.readyState === 4) { // if response has fully arrived
                if (xhttp.status !== 200) { console.log("XMLHttpRequest failed."); return; }
                if (xhttp.responseText === "failure") { console.log(`Failed to load level: ${name}`); return; }

                const response = JSON.parse(xhttp.responseText);
                this.LEVELS.push(new Level(response[0], response[1][0].length, response[1].length, response[1]));
                if(b_switch_to) this.changeLevel(response[0]);
            }
        }, false);
        xhttp.send(data);
    }

    isNearTile(pos, tiles, range) {
        const level = JSON.parse(JSON.stringify(this.getCurrentLevel()));

        const top_left = new Vector(
            g_CANVAS.width/2-this.current_level_size.x/2,
            g_CANVAS.height/2-this.current_level_size.y/2
        )
        const relative = Vector.subtract(pos, top_left);

        const matrix_pos = new Vector(
            Math.floor(relative.x/g_TILESIZE), // px to matrix position
            Math.floor(relative.y/g_TILESIZE) // px to matrix position
        );

        let y = 0;
        for (let row of level.floor) {
            if (y>=matrix_pos.y-range && y<=matrix_pos.y+range) {
                let x = 0;
                for (let t of row) {
                    if (x>=matrix_pos.x-range && x<=matrix_pos.x+range) {
                        if (tiles.includes(t)) {
                            return {is_near: true, tile: t, position: Vector.add(top_left, new Vector(x*g_TILESIZE, y*g_TILESIZE))};
                        }
                    }
                    x++;
                }
            }
            y++;
        }
        return {is_near: false};
    }

    spawnEnemy(e) {
        this.ENEMIES.push(e);
    }

    removeEnemy(e) {
        this.ENEMIES = array_pop(this.ENEMIES, e);
    }

    #calc_level_size() {
        // formula = (center of screen) - (size of tiles)
        const level = this.getCurrentLevel();
        return new Vector(
            g_TILESIZE*Math.floor(level.floor[0].length), 
            g_TILESIZE*Math.floor(level.floor.length)
        );
    }
}

export { World };