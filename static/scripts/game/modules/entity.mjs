import { g_CANVAS } from "../main.js";
import { Vector } from "../utilities.js";

/**
 * Base entity class.
 * 
 * Properties:
 * - `position` -> `Vector` of the current true position.
 * - `velocity` -> `Vector` of the current velocity.
 * 
 * Methods:
 * - `setPosition()` -> Sets the `position` given a `Vector`
 * - `addPosition()` -> Adds a `Vector` to the `position`
 */
class Entity {
    constructor(position, velocity) {
        this.position = position;
        this.velocity = velocity;
    }

    setPosition(v) {
        this.position = v;
    }

    addPosition(v) {
        this.position = Vector.add(this.position, v);
    }
}

/**
 * Player class
 * 
 * Properties:
 * - `position` -> `Vector` of the current true position.
 * - `velocity` -> `Vector` of the current velocity.
 * - `movespeed` -> `Vector` of the move speed of the player
 * - `move_direction` -> `Vector` of the movement of the player
 * 
 * Methods:
 * - `setPosition()` -> Sets the `position` given a `Vector`
 * - `addPosition()` -> Adds a `Vector` to the `position`
 */
class Player extends Entity {
    constructor(position, velocity, movespeed) {
        super(position, velocity);
        this.move_direction = Vector.zero();
        this.movespeed = movespeed; // px/s
    }
}

export { Player };