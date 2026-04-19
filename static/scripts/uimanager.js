import { array_pop, Vector } from "./utilities.js";

/**
 * A UIManager singleton created in `init()`.
 * Accessed through the UI global variable.
 * 
 * Properties:
 * - `class` -> The name of the class
 * - `name`
 * - `parent`
 * - `canvases` -> A list of `Canvas` instances, sorted by z-index/draw order
 * 
 * Methods:
 * - `addCanvas()` -> Adds a `Canvas` instance to `this.canvases`
 * - `removeCanvas()` -> Removes a `Canvas` instance from `this.canvases` and invokes `Canvas.cleanup()`
 * - `getCanvasByName()` -> Returns a `Canvas` instance from `this.canvases` found by `Canvas.name`
 */
class UIManager {
    constructor() {
        this.canvases = [];
    }

    addCanvas(c) {
        if (!c instanceof Canvas) return;
        c.parent = this;
        this.canvases.push(c);
    }
    removeCanvas(c) {
        if (!this.canvases.includes(c)) return;

        c.parent = null;
        c.cleanup();
        this.canvases = array_pop(this.canvases, c);
    }
    getCanvasByName(name) {
        for (let c of this.canvases)
            if (c.name === name) return c
        return null;
    }
}

/**
 * A base UI class which all UI-related classes inherit from
 * 
 * Properties:
 * - `class` -> The name of the class
 * - `name`
 * - `parent`
 * - `children` -> A list of children, sorted by z-index/draw order
 * - `allowed_children` -> A list of allowed children
 * - `visible`
 * 
 * Methods:
 * - `cleanup()` -> "Deletes" this instance by setting `this.parent` to `null` and invoking `cleanup()` on all children
 * - `addChild()` -> Adds an instance to `this.children` if it is an allowed type
 * - `removeChild()` -> Removes an instance from `this.children` and invokes `c.cleanup()`
 * - `getChildByName()` -> Returns an instance from `this.children` found by `c.name`
 */
class BaseUI {
    constructor(name) {
        this.class = "BaseUI"

        this.name = name;
        this.parent = null;
        this.children = [];
        this.allowed_children = ["UIElement"];
        this.visible = true;
    }
    cleanup() {
        this.parent = null;
        for (let c of this.children)
            if (c.parent !== null) c.cleanup();
    }

    addChild(c) {
        if (!this.allowed_children.includes(c.class)) return;

        c.parent = this;
        this.children.push(c);
    }
    removeChild(c) {
        if (!this.children.includes(c)) return;

        c.parent = null;
        c.cleanup();
        this.children = array_pop(this.children, c);
    }
    getChildByName(name) {
        for (let c of this.children)
            if (c.name === name) return c
        return null;
    }
}

/**
 * A class which contains UI elements, stored in an array in UIManager.
 * A `Canvas` is the size of the screen
 * 
 * Properties:
 * - `class` -> The name of the class
 * - `name`
 * - `parent`
 * - `children` -> A list of children, sorted by z-index/draw order
 * - `allowed_children` -> A list of allowed children
 * - `visible`
 * 
 * Methods:
 * - `cleanup()` -> "Deletes" this instance by setting `this.parent` to `null` and invoking `cleanup()` on all children
 * - `addChild()` -> Adds an instance to `this.children` if it is an allowed type
 * - `removeChild()` -> Removes an instance from `this.children` and invokes `c.cleanup()`
 * - `getChildByName()` -> Returns an instance from `this.children` found by `c.name`
 */
class Canvas extends BaseUI {
    constructor(name) {
        super(name);
        this.class = "Canvas";

        this.name = name;
    }

    addChild(c) {
        super.addChild(c);
        c.canvas = this;
    }
}

/**
 * A class which contains UI elements, stored in an array in UIManager
 * 
 * Properties:
 * - `class` -> The name of the class
 * - `name`
 * - `parent` -> The parent of the element
 * - `canvas` -> The canvas of the element
 * - `children` -> A list of children, sorted by z-index/draw order
 * - `allowed_children` -> A list of allowed children
 * - `visible`
 * - `position` -> *Note: Relative to the parent of the element
 * - `size`
 * - `background_color` -> The background color of the element, given in RGBA
 * 
 * Methods:
 * - `cleanup()` -> "Deletes" this instance by setting `this.parent`, `this.canvas` to `null` and invoking `cleanup()` on all children
 * - `addChild()` -> Adds an instance to `this.children` if it is an allowed type
 * - `removeChild()` -> Removes an instance from `this.children` and invokes `c.cleanup()`
 * - `getChildByName()` -> Returns an instance from `this.children` found by `c.name`
 */
class UIElement extends BaseUI {
    constructor(name, position, size) {
        super(name);
        this.class = "UIElement"

        this.name = name;
        this.allowed_children = this.allowed_children.concat(["Text"]);
        this.canvas = null;
        
        this.position = position;
        this.size = size;
        this.background_color = `rgba(0,0,0,1)`;
    }
    cleanup() {
        super.cleanup();
        this.canvas = null;
    }

    addChild(c) {
        super.addChild(c);
        c.canvas = this.canvas;
    }

    draw(g_CONTEXT) {
        if (!this.visible) return;

        let draw_pos = this.position;
        if (this.parent !== null && this.parent !== this.canvas) draw_pos = Vector.add(draw_pos, this.parent.position);

        g_CONTEXT.fillStyle = this.background_color;
        g_CONTEXT.fillRect(...draw_pos.toArray(), ...this.size.toArray());

        for (let e of this.children)
            e.draw(g_CONTEXT);

        return draw_pos;
    }
}

class Text extends UIElement {
    constructor(name, value, position, background_size) {
        super(name, position, background_size);
        this.class = "Text";
        this.allowed_children = [];

        this.value = value;
        this.color = "rgba(0,0,0,1)";
    }

    draw(g_CONTEXT) {
        if (!this.visible) return;
        let draw_pos = super.draw(g_CONTEXT);

        g_CONTEXT.fillStyle = this.color;
        g_CONTEXT.fillText(this.value, ...draw_pos.toArray());
    }
}

export { UIManager, Canvas, UIElement, Text };