import { randint } from "../utilities.js";

const Tiles = {
    None: {color: "black", collision: true},
    Grass: {color: "green", collision: false},
    Dirt: {color: "red", collision: false},
    Water: {color: "blue", collision: true}
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
                for (let w = 0; w<width; w++) row.push([Tiles.None, Tiles.Grass, Tiles.Grass, Tiles.Dirt, Tiles.Water][randint(0,4)]);
                this.floor.push(row);
            }
        }
    }
}

export { Level, Tiles, g_TILESIZE };