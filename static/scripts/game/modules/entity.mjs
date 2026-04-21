import { g_CANVAS, g_CONTEXT, g_WORLD, g_PLAYER, g_DT, g_MOUSE } from "../main.js";
import { Vector, randint } from "../../utilities.js";
import { Tiles, g_TILESIZE } from "./level.mjs";

let g_ENTITY_ID = 0;

/**
 * Base entity class.
 * 
 * Properties:
 * - `position` -> `Vector` of the current true position.
 * - `velocity` -> `Vector` of the current velocity.
 * - `size` -> `Vector` of the size
 * - `ignore_collision` -> A list of tiles to ignore collision with
 * 
 * Methods:
 * - `setPosition()` -> Sets the `position` given a `Vector`. Collision is done here.
 * - `addPosition()` -> Adds a `Vector` to the `position`
 */
class Entity {
    constructor(position, velocity, size, health) {
        this.position = Vector.add(g_WORLD.position, position);
        this.velocity = velocity;
        this.size = size;
        this.health = health;
        this.ignore_collision = [];
        this.id = g_ENTITY_ID;
        g_ENTITY_ID++;
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
 * - `ignore_collision` -> A list of tiles to ignore collision with
 * - `movespeed` -> `Vector` of the move speed of the player
 * - `move_direction` -> `Vector` of the movement of the player
 * - `health` -> The health of the player
 * - `iframes` -> Invulnerability for the player
 * - `dashframes` -> Dash animation frames
 * 
 * Methods:
 * - `setPosition()` -> Sets the `position` given a `Vector`. Collision is done here.
 * - `addPosition()` -> Adds a `Vector` to the `position`
 * - `damage()` -> Damages the player.
 * - `attack()` -> Attacks
 */
class Player extends Entity {
    constructor(position, velocity, size, movespeed) {
        super(position, velocity, size, 3);
        this.move_direction = Vector.zero();
        this.movespeed = movespeed; // px/s
        this.iframes = 0;
        this.dashframes = 0;
        this.dashtarget = null;
        this.dashcooldown = 0; //s
        this.attacksize = 35;
    }

    damage(e, dmg) {
        if (this.iframes<=0) {
            this.health -= dmg;
            if (this.health<0) {
                // console.log("Died!");
            } else {
                this.iframes = 10;
            }
        }
    }

    dash() {
        if (this.dashcooldown>0.1) return;
        this.dashcooldown = 0;

        if (this.dashframes<=0) {
            // setup
            this.dashframes = 6;
            this.iframes += 6;
            this.dashtarget = Vector.zero();
            this.dashtarget.set(this.move_direction);
        } else if (this.dashframes>0) {
            // dash
            this.dashframes--;
            this.addPosition(Vector.scale(this.dashtarget, 300/g_DT));
            if (this.dashframes<=0) {
                // reset
                this.dashcooldown = 1.5;
            }
        }
    }

    attack() {
        let attack_pos = g_MOUSE;
        const player_center = new Vector(this.position.x+(this.size.x/2), this.position.y+(this.size.y/2));
        const mouse_displacement = Vector.subtract(g_MOUSE,player_center);
        if (Vector.magnitude(mouse_displacement)>this.attacksize) {
            attack_pos = Vector.add(
                player_center,
                Vector.scale(Vector.normalize(mouse_displacement), this.attacksize)
            );
        }

        for (let e of g_WORLD.ENEMIES) {
            if (Vector.magnitude(Vector.subtract(e.position, attack_pos))<this.attacksize) {
                e.damage(1);
            }
        }
    }
}

class Enemy extends Entity {
    constructor(position, velocity, size, movespeed, health) {
        super(position, velocity, size, health);
        this.type = "Enemy";
        this.movespeed = movespeed;
    }

    setPosition(v) {
        let b_collided = super.setPosition(v);

        if (Vector.magnitude(Vector.subtract(g_PLAYER.position, this.position))<Vector.magnitude(g_PLAYER.size)) {
            g_PLAYER.damage(this, 1);
        }

        return b_collided;
    }

    damage(dmg) {
        this.health -= dmg;
        if (this.health<=0) {
            g_WORLD.removeEnemy(this);
        }
    }
}

/**
 * An Enemy which holds position for a certain amount of time, tracking the player,
 * and then dashes towards where the player was until it collides with a wall
 * 
 * Properties:
 * - `position` -> `Vector` of the current true position.
 * - `velocity` -> `Vector` of the current velocity.
 * - `size` -> `Vector` of the size
 * - `ignore_collision` -> A list of tiles to ignore collision with
 * 
 * Methods:
 * - `setPosition()` -> Sets the `position` given a `Vector`. Collision is done here.
 * - `addPosition()` -> Adds a `Vector` to the `position`
 * - `update()` -> Triggers Enemy behaviour, updates Enemy state
 */
class Dasher extends Enemy {
    constructor(position, velocity, size) {
        super(position, velocity, size, new Vector(200,200), 1);
        this.type = "Dasher";
        this.color = "purple";

        this.target = null;
        this.cooldown = 3; // seconds
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
        return b_collided;
    };
}

class Zombie extends Enemy {
    constructor(position, velocity, size, movespeed) {
        super(position, velocity, size, movespeed, 3);
        this.type = "Zombie";
        this.color = "green";
    }

    update() {
        this.target = Vector.normalize(Vector.subtract(g_PLAYER.position, this.position));
        this.addPosition(Vector.multiply(this.target, this.movespeed));
    }
}

class Skeleton extends Enemy {
    constructor(position, velocity, size) {
        super(position, velocity, size, new Vector(20,20), 2);
        this.type = "Skeleton";
        this.color = "white";

        this.cooldown = 2;
        this.b_moving = false;
        this.target = null;
    }

    update() {
        if (this.cooldown>0.1) {
            this.cooldown -= 1/g_DT;

            // skeleton moves while on cd
            if (!this.b_moving) {
                // select movement target
                this.b_moving = true;
                this.target = new Vector(randint(-10,10)/10, randint(-10,10)/10);
            } else if (this.target !== null) {
                // move towards target
                this.addPosition(Vector.multiply(this.target, Vector.scale(this.movespeed, 1/g_DT)));
            }
            return;
        }
        this.target = null;
        this.b_moving = false;
        this.cooldown = 2;

        // shoot!
        g_WORLD.spawnEnemy(new Bullet(
            this.position,
            Vector.zero(),
            new Vector(5,5),
            new Vector(250,250)
        ))
    }
}

class Bullet extends Dasher {
    constructor(position, velocity, size, movespeed) {
        super(position, velocity, size, 100000);
        this.movespeed = movespeed;
        this.type = "Bullet";
        this.color = "red";

        this.cooldown = 0;
        this.b_moving = false;
    }

    setPosition(v) {
        let b_collided = super.setPosition(v);
        if (b_collided) {
            g_WORLD.removeEnemy(this);
        }
    }
}

export { Player, Dasher, Zombie, Skeleton };