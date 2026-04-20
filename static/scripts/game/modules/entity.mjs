import { g_CANVAS, g_CONTEXT, g_WORLD, g_PLAYER, g_DT } from "../main.js";
import { Vector } from "../../utilities.js";
import { Tiles, g_TILESIZE } from "./level.mjs";

/**
 * Base entity class.
 * 
 * Properties:
 * - `position` -> `Vector` of the current true position.
 * - `velocity` -> `Vector` of the current velocity.
 * - `size` -> `Vector` of the size
 * 
 * Methods:
 * - `setPosition()` -> Sets the `position` given a `Vector`. Collision is done here.
 * - `addPosition()` -> Adds a `Vector` to the `position`
 */
class Entity {
    constructor(position, velocity, size) {
        this.position = position;
        this.velocity = velocity;
        this.size = size;
        this.ignore_collision = [];
    }

    // collision is done here!!
    setPosition(v) {
        let d = Vector.zero();
        d.set(v); // deep copy v

        // TODO: check collision with other entities

        const delta = Vector.subtract(v, this.position);

        //#region COLLISION
        let b_collided = false;
        function calc_depenetration(self,e,t) {
            // //#region DEBUG
            // g_CONTEXT.fillStyle = "purple";
            // g_CONTEXT.fillRect(...Vector.add(t, new Vector(g_TILESIZE/2-5, g_TILESIZE/2-5)).toArray(), 10,10);
            // //#endregion
            let ret = Vector.zero();
            // overlap = distance - (half the size of e + half the size of t)
            const t_size = new Vector(g_TILESIZE, g_TILESIZE);
            const distance = Vector.subtract(
                Vector.add(t, Vector.scale(t_size,1/2)),
                Vector.add(e, Vector.scale(self.size,1/2))
            );
            
            let direction = Vector.zero()
            if (distance.x !== 0) {
                direction.x = (distance.x > 0) ? 1 : -1;
                ret.x = Math.abs(distance.x) - (self.size.x/2+t_size.x/2);
                ret.x *= direction.x;
            }
            if (distance.y !== 0) {
                direction.y = (distance.y > 0) ? 1 : -1;
                ret.y = Math.abs(distance.y) - (self.size.y/2+t_size.y/2);
                ret.y *= direction.y;
            }
            return Vector.add(ret, 
                Vector.scale(direction, -1) // buffer of 2px added to depenetration
            );
        }

        if (delta.x !== 0) {
            // when movement occurs on x we need to decide whether to check right corners or left corners using delta.x>0
            let corners = { // checks left corners by default
                bottom: new Vector(v.x, this.position.y+this.size.y),
                top: new Vector(v.x, this.position.y)
            }
            if (delta.x > 0) { // if moving to the right, check right corners instead by offsetting by this.size.x
                corners.bottom.x += this.size.x;
                corners.top.x += this.size.x;
            }

            let projections = {
                bottom: g_WORLD.getTileAt(corners.bottom),
                top: g_WORLD.getTileAt(corners.top)
            }

            if (Tiles[projections.bottom.tile].collision && !this.ignore_collision.includes(projections.bottom.tile)) {
                d.x += calc_depenetration(this, new Vector(v.x,this.position.y), projections.bottom.position).x;
                b_collided = true;
            }
            else if (Tiles[projections.top.tile].collision && !this.ignore_collision.includes(projections.top.tile)) {
                d.x += calc_depenetration(this, new Vector(v.x,this.position.y), projections.top.position).x;
                b_collided = true;
            }
        }

        if (delta.y !== 0) {
            let corners = { // checks top corners by default
                left: new Vector(d.x,v.y),
                right: new Vector(d.x+this.size.x,v.y)
            }
            if (delta.y > 0) {// if moving down, check bottom corners instead by offsetting by this.size.y
                corners.right.y += this.size.y;
                corners.left.y += this.size.y;
            }

            let projections = {
                left: g_WORLD.getTileAt(corners.left),
                right: g_WORLD.getTileAt(corners.right)
            }

            if (Tiles[projections.left.tile].collision && !this.ignore_collision.includes(projections.left.tile)) {
                d.y += calc_depenetration(this, new Vector(this.position.x,v.y), projections.left.position).y;
                b_collided = true;
            }
            else if (Tiles[projections.right.tile].collision && !this.ignore_collision.includes(projections.right.tile)) {
                d.y += calc_depenetration(this, new Vector(this.position.x,v.y), projections.right.position).y;
                b_collided = true;
            }
        }
        //#endregion

        this.position = d;
        return b_collided;
    }

    addPosition(v) {
        this.setPosition(Vector.add(this.position, v))
    }
}

/**
 * Player singleton, access through g_PLAYER in main
 * 
 * Properties:
 * - `position` -> `Vector` of the current true position of the player
 * - `velocity` -> `Vector` of the current velocity of the player
 * - `size` -> `Vector` of the size of the player
 * - `movespeed` -> `Vector` of the move speed of the player
 * - `move_direction` -> `Vector` of the movement of the player
 * 
 * Methods:
 * - `setPosition()` -> Sets the `position` given a `Vector`. Collision is done here.
 * - `addPosition()` -> Adds a `Vector` to the `position`
 */
class Player extends Entity {
    constructor(position, velocity, size, movespeed) {
        super(position, velocity, size);
        this.move_direction = Vector.zero();
        this.movespeed = movespeed; // px/s
    }
}

class Dasher extends Entity {
    constructor(position, velocity, size, movespeed) {
        super(position, velocity, size);
        this.type = "Dasher";
        this.movespeed = movespeed;

        this.target = null;
        this.cooldown = 0; // seconds
        this.b_moving = false;

        this.ignore_collision = ["Water"];
    } 

    update() {
        if(this.cooldown>0.1) {
            this.cooldown -= 1/g_DT;
            return;
        }

        // first time setup
        if (!this.b_moving) {
            this.b_moving = true;
            this.target = Vector.normalize(Vector.subtract(g_PLAYER.position, this.position))
            return;
        }

        // go towards target
        this.addPosition(Vector.multiply(this.target, Vector.scale(this.movespeed, 1/g_DT)));
    }

    setPosition(v) {
        let b_collided = super.setPosition(v);
        if(b_collided) {
            this.target = null;
            this.b_moving = false;
            this.cooldown = 5; // seconds
        }
    };
}

export { Player, Dasher };