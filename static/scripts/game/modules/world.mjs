import { g_CANVAS } from "../main.js";
import { Level, Tiles, g_TILESIZE } from "./level.mjs";
import { Vector } from "../utilities.js";

/**
 * A World singleton created in `init()`. 
 * Accessed through the WORLD global variable.
 * 
 * Properties:
 * - `current_level` -> The current level id (index in `World.LEVELS`). 
 *      + **Default: 0**
 * - `LEVELS` -> A list of Level instances
 * - `current_level_size` -> A `Vector` of the pixel size of the current floor
 * 
 * Methods:
 * - `getCurrentLevel()` -> Returns the current `Level` instance
 * - `getTileAt()` -> Returns a tile enum at the `Vector` location and a position of the top left corner of the tile
 */
class World {
    constructor() {
        this.current_level = 0;
        this.LEVELS = [];
        this.LEVELS.push(new Level(25,25));// generate basic level0 fallback
        this.current_level_size = this.#calc_level_size();
    }

    getCurrentLevel() {
        return this.LEVELS[this.current_level];
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
            tile: Tiles.None,
            position: Vector.add(Vector.scale(matrix_pos,g_TILESIZE), top_left), // reverse the process but this will go to the top left as we are working with matrix positions
        };
        if (!((matrix_pos.x<0 || matrix_pos.x>=level.floor[0].length) || (matrix_pos.y<0 || matrix_pos.y>=level.floor.length))) {
            // inside the bounds of map
            ret.tile = level.floor[matrix_pos.y][matrix_pos.x]
        }
        //#endregion

        return ret;
    }

    loadLevel(id) {
        if (id < this.LEVELS.length) {
            this.current_level = id;
            this.current_level_size = this.#calc_level_size();
        }
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