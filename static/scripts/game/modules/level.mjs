import { randint, Vector } from "../../utilities.js";

const Tiles = {
    None: {color: "rgba(0,0,0,1)", collision: true},
    Empty: {color: "rgba(255,255,255,1)", collision: false},
    Wall: {color: "rgba(125,125,125,1)", collision: true},
    Grass: {color: "rgba(0,255,0,1)", collision: false},
    Dirt: {color: "rgba(168, 121, 50,1)", collision: false},
    Water: {color: "rgba(0,0,255,1)", collision: true},
    Door: {color: "rgba(91,106,139,1)", collision: false, interact: door_interact}
};
const g_TILESIZE = 30; // px 

let g_HARDCODED_LEVEL_NUMBER = 0;
let music_PROGRESS = new Audio("/static/audio/new_level.wav");
music_PROGRESS.addEventListener("ended", () => {music_PROGRESS.currentTime=0;}, false);

//#region TILE BEHAVIOURS
function door_interact(g_WORLD, enemies) {
    if (g_WORLD.ENEMIES<=0) {
        g_WORLD.changeLevel(`level${g_HARDCODED_LEVEL_NUMBER}`);
        g_WORLD.loadLevel(`level${g_HARDCODED_LEVEL_NUMBER+1}`, false);
        music_PROGRESS.play();
        // spawn enemies - temporary, i dont want to hardcode this but i might have to for now
        switch (g_HARDCODED_LEVEL_NUMBER) {
            case 0:
                g_WORLD.spawnEnemy(new enemies.Dasher(
                    new Vector(150,100), 
                    Vector.zero(), 
                    new Vector(10,10), 
                ));
                g_WORLD.spawnEnemy(new enemies.Dasher(
                    new Vector(150,300), 
                    Vector.zero(), 
                    new Vector(10,10), 
                ));
                g_WORLD.spawnEnemy(new enemies.Dasher(
                    new Vector(500,100), 
                    Vector.zero(), 
                    new Vector(10,10), 
                ));
                g_WORLD.spawnEnemy(new enemies.Dasher(
                    new Vector(500,300), 
                    Vector.zero(), 
                    new Vector(10,10), 
                ));
                break;
            case 1:
                g_WORLD.spawnEnemy(new enemies.Zombie(
                    new Vector(150,500),
                    Vector.zero(),
                    new Vector(20,20),
                    new Vector(2,2)
                ));
                g_WORLD.spawnEnemy(new enemies.Zombie(
                    new Vector(100,500),
                    Vector.zero(),
                    new Vector(30,30),
                    new Vector(1,1)
                ));
                g_WORLD.spawnEnemy(new enemies.Zombie(
                    new Vector(500,500),
                    Vector.zero(),
                    new Vector(20,20),
                    new Vector(2,2)
                ));
                g_WORLD.spawnEnemy(new enemies.Skeleton(
                    new Vector(500,100),
                    Vector.zero(),
                    new Vector(15,15)
                ));
                break;
            case 2:
                g_WORLD.spawnEnemy(new enemies.Dasher(
                    new Vector(150,350), 
                    Vector.zero(), 
                    new Vector(10,10), 
                ));
                g_WORLD.spawnEnemy(new enemies.Dasher(
                    new Vector(150,600), 
                    Vector.zero(), 
                    new Vector(10,10), 
                ));
                g_WORLD.spawnEnemy(new enemies.Dasher(
                    new Vector(500,350), 
                    Vector.zero(), 
                    new Vector(10,10), 
                ));
                g_WORLD.spawnEnemy(new enemies.Dasher(
                    new Vector(350,600), 
                    Vector.zero(), 
                    new Vector(10,10), 
                ));
                g_WORLD.spawnEnemy(new enemies.Skeleton(
                    new Vector(200,700),
                    Vector.zero(),
                    new Vector(15,15)
                ));
                g_WORLD.spawnEnemy(new enemies.Skeleton(
                    new Vector(500,700),
                    Vector.zero(),
                    new Vector(15,15)
                ));
                g_WORLD.spawnEnemy(new enemies.Zombie(
                    new Vector(400,600),
                    Vector.zero(),
                    new Vector(17,17),
                    new Vector(4,4)
                ));
                g_WORLD.spawnEnemy(new enemies.Zombie(
                    new Vector(300,600),
                    Vector.zero(),
                    new Vector(20,20),
                    new Vector(2,2)
                ));
                break;
            case 3:
                g_WORLD.spawnEnemy(new enemies.Skeleton(
                    new Vector(50,400),
                    Vector.zero(),
                    new Vector(15,15)
                ));
                g_WORLD.spawnEnemy(new enemies.Skeleton(
                    new Vector(50,300),
                    Vector.zero(),
                    new Vector(15,15)
                ));
                g_WORLD.spawnEnemy(new enemies.Skeleton(
                    new Vector(700,300),
                    Vector.zero(),
                    new Vector(15,15)
                ));
                g_WORLD.spawnEnemy(new enemies.Skeleton(
                    new Vector(700,400),
                    Vector.zero(),
                    new Vector(15,15)
                ));
                break;
        }
        g_HARDCODED_LEVEL_NUMBER++;
    } else {
        console.log("enemies still live!");
        console.log(g_WORLD.ENEMIES);
    }
}
//#endregion

/**
 * A level class, contained by `World`.
 * Properties:
 * - `floor` -> A matrix of Tile enums
 * 
 * Methods:
 */
class Level {
    constructor(name, width, height, floor=undefined) {
        this.name = name;
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