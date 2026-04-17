// Returns a random integer, inclusive
function randint(min,max) {
    return Math.floor(Math.random()*(max-min+1))+min;
}
function array_pop(arr, item) {
    let index = arr.indexOf(item);
    if (index !== -1) arr.splice(index, 1);
    return arr;
}

/**
 * A Vector class, my own implementation! :D
 * 
 * Properties:
 * - `x`
 * - `y`
 * 
 * Methods:
 * - `toString()`
 * - `toArray()`
 * - `static zero()` -> Returns a zero vector
 * - `static add()` -> Adds two `Vector` instances
 * - `static subtract()` -> Adds two `Vector` instances
 * - `static multiply()` -> Multiplies two `Vector` instances
 * - `static multiply()` -> Multiplies the x,y of a `Vector` instance by a scalar
 * - `static divide()` -> Divides two `Vector` instances
 * - `static normalize()` -> Normalizes the given `Vector` instance
 * - `set()` -> Deep copies/sets a Vector
 */
class Vector {
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }

    toString() {
        return `Vector(${this.x},${this.y})`;
    }

    toArray() {
        return [this.x, this.y];
    }

    static zero() {
        return new Vector(0,0);
    }
    
    static add(v1, v2) {
        return new Vector(v1.x+v2.x, v1.y+v2.y);
    }

    static subtract(v1, v2) {
        return new Vector(v1.x-v2.x, v1.y-v2.y);
    }

    static multiply(v1, v2) {
        return new Vector(v1.x*v2.x, v1.y*v2.y);
    }

    // Pass 1/n to divide by scalar
    static scale(v, n) {
        return new Vector(v.x*n, v.y*n);
    }

    static divide(v1, v2) {
        return new Vector(v1.x/v2.x, v1.y/v2.y);
    }

    static normalize(v) {
        const mag = Math.sqrt((v.x**2)+(v.y**2));
        return mag === 0 ? Vector.zero() : Vector.scale(v, 1/mag);
    }

    set(v) {
        this.x = v.x;
        this.y = v.y;
        return this;
    }
}

export { randint, array_pop, Vector };