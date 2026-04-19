import { randint } from "../../utilities.js";

const Tiles = {
    None: {color: "rgba(0,0,0,1)", collision: true},
    Empty: {color: "rgba(255,255,255,1)", collision: false},
    Wall: {color: "rgba(125,125,125,1)", collision: true},
    Grass: {color: "rgba(0,255,0,1)", collision: false},
    Dirt: {color: "rgba(255,0,0,1)", collision: false},
    Water: {color: "rgba(0,0,255,1)", collision: true}
};
const g_TILESIZE = 30; // px 

/**
 * A level class, contained by `World`.
 * TODO: Make level editor, where constructor will parse JSON into `Level.floor` matrix.
 * 
 * Properties:
 * - `floor` -> A matrix of Tile enums
 * 
 * Methods:
 */
class Level {
    constructor(width, height, floor=undefined) {
        // constructor overloading
        if (floor !== undefined) {
            // if preset floor is passed
            this.floor = floor;
        } else {
            this.floor = [];
            // if no preset floor is passed, generate a random one
            for (let h = 0; h<height; h++) {
                let row = [];
                for (let w = 0; w<width; w++) row.push([Tiles.Wall, Tiles.Grass, Tiles.Grass, Tiles.Dirt, Tiles.Water][randint(0,4)]);
                this.floor.push(row);
            }
        }
    }
}

export { Level, Tiles, g_TILESIZE };