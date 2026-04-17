import { g_CANVAS, g_CONTEXT, g_WORLD } from "../main.js";
import { Vector } from "../utilities.js";
import { g_TILESIZE } from "./level.mjs";

/**
 * Base entity class.
 * 
 * Properties:
 * - `position` -> `Vector` of the current true position.
 * - `velocity` -> `Vector` of the current velocity.
 * - `size` -> `Vector` of the size
 * 
 * Methods:
 * - `setPosition()` -> Sets the `position` given a `Vector`
 * - `addPosition()` -> Adds a `Vector` to the `position`
 */
class Entity {
    constructor(position, velocity, size) {
        this.position = position;
        this.velocity = velocity;
        this.size = size;
    }

    // collision is done here!!
    setPosition(v) {
        let d = Vector.zero();
        d.set(v); // deep copy v

        // TODO: check collision with other entities

        const delta = Vector.subtract(v, this.position);

        //#region COLLISION
        function calc_depenetration(self,e,t) {
            //#region DEBUG
            // g_CONTEXT.fillStyle = "blue";
            // g_CONTEXT.fillRect(...Vector.add(t, new Vector(g_TILESIZE/2-5, g_TILESIZE/2-5)).toArray(), 10,10);
            //#endregion
            let ret = Vector.zero();
            // overlap = distance - (half the size of e + half the size of t)
            const t_size = new Vector(g_TILESIZE, g_TILESIZE);
            const distance = Vector.subtract(
                Vector.add(t, Vector.scale(t_size,1/2)),
                Vector.add(e, Vector.scale(self.size,1/2))
            );
            if (distance.x !== 0) {
                let direction = (distance.x > 0) ? 1 : -1;
                ret.x = Math.abs(distance.x) - (self.size.x/2+t_size.x/2);
                ret.x *= direction;
            }
            if (distance.y !== 0) {
                let direction = (distance.y > 0) ? 1 : -1;
                ret.y = Math.abs(distance.y) - (self.size.y/2+t_size.y/2);
                ret.y *= direction;
            }
            return ret;
        }

        if (delta.x !== 0) {
            let projx = g_WORLD.getTileAt(
                new Vector( // add the size of the entity to determine which edge to look at
                    v.x + (delta.x > 0 ?
                        this.size.x : // +ve movement x = right edge, add full size from left corner
                        0),           // -ve movement x = left edge, dont add anything to x because pos starts from left edge
                    this.position.y + this.size.y/2 // always go to center of edge in y axis
                )
            );
            if (projx.tile.collision) d.x += calc_depenetration(this, new Vector(v.x,this.position.y), projx.position).x;
        }

        if (delta.y !== 0) {// if moving in y
            let projy = g_WORLD.getTileAt(
                new Vector( // add the size of the entity to determine which edge to look at
                    this.position.x + this.size.x/2, // always go to center of edge in x axis
                    v.y + (delta.y > 0 ?
                        this.size.y : // +ve movement y = bottom edge, add full size from top corner
                        0)            // -ve movement y = top edge, dont add anything to y because pos starts from top edge
                )
            );
            if (projy.tile.collision) d.y += calc_depenetration(this, new Vector(this.position.y, v.y), projy.position).y;
        }
        //#endregion

        this.position = d;
    }

    addPosition(v) {
        this.setPosition(Vector.add(this.position, v))
    }
}

/**
 * Player class
 * 
 * Properties:
 * - `position` -> `Vector` of the current true position of the player
 * - `velocity` -> `Vector` of the current velocity of the player
 * - `size` -> `Vector` of the size of the player
 * - `movespeed` -> `Vector` of the move speed of the player
 * - `move_direction` -> `Vector` of the movement of the player
 * 
 * Methods:
 * - `setPosition()` -> Sets the `position` given a `Vector`
 * - `addPosition()` -> Adds a `Vector` to the `position`
 */
class Player extends Entity {
    constructor(position, velocity, size, movespeed) {
        super(position, velocity, size);
        this.move_direction = Vector.zero();
        this.movespeed = movespeed; // px/s
    }
}

export { Player };