import { Level, Tiles, g_TILESIZE } from "./level.mjs";

/**
 * A World class created in `init()`. 
 * Only one of these exists, accessed through the WORLD global variable.
 * 
 * Properties:
 * - `current_level` -> The current level id (index in `World.LEVELS`). 
 *      + **Default: 0**
 * 
 * Methods:
 * - `getCurrentLevel()` -> Returns the current `Level` instance
 */
class World {
    constructor() {
        this.current_level = 0;
        this.LEVELS = [];
        this.LEVELS.push(new Level(8,8));// generate basic level0 fallback
    }

    getCurrentLevel() {
        return this.LEVELS[this.current_level];
    }
}

export { World };