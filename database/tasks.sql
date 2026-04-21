PRAGMA foreign_keys = ON
;

DROP TABLE IF EXISTS levels
;
DROP TABLE IF EXISTS users
;
DROP TABLE IF EXISTS permissions
;


CREATE TABLE permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR NOT NULL UNIQUE
)
;
-- SEED
INSERT INTO permissions(name)
VALUES ('USER'), ('ADMIN')
;


CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR NOT NULL UNIQUE,
    password VARCHAR NOT NULL,
    permission_id INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (permission_id) REFERENCES permissions(id)
)
;
-- SEED
INSERT INTO users(username, password, permission_id)
VALUES (
    'ADMIN',
    'scrypt:32768:8:1$v6YzVtdQ6HawdJfR$5ab41d01354b777aead5ed68ca5d9fc71db37cb32b724b85463901b85f85c568d23fc59ec08f1c8d9fae7eaf77fd1e93d0a1d1f1a586bd578cf7322d7565543f',
    2
)
;


CREATE TABLE levels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    creator_id INTEGER NOT NULL,
    name VARCHAR NOT NULL UNIQUE,
    floor VARCHAR NOT NULL,
    FOREIGN KEY (creator_id) REFERENCES users(id)
)
;
-- SEED
INSERT INTO levels(creator_id, name, floor)
VALUES (
    0, 'menu',
    '[["None","None","None","None","None","None","None","None","None","Wall","Wall","Empty","Empty","Empty","Empty","Empty","Wall","Wall","None","None","None","None","None","None","None"],["None","None","None","None","None","None","None","Wall","Wall","Wall","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Wall","Wall","Wall","None","None","None","None","None"],["None","None","None","None","None","Wall","Wall","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Wall","Wall","None","None","None","None"],["None","None","None","None","None","Wall","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Wall","Wall","None","None","None"],["None","None","None","None","Wall","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Wall","None","None"],["None","None","None","Wall","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Wall","None"],["None","None","None","Wall","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Wall","None"],["None","None","Wall","Wall","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Wall","None"],["None","None","Wall","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Dirt","Grass","Wall","None"],["None","Wall","Wall","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Dirt","Dirt","Grass","Grass","Wall","None"],["Wall","Wall","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Dirt","Dirt","Dirt","Wall"],["Wall","Grass","Grass","Dirt","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Dirt","Grass","Dirt","Dirt","Wall"],["Wall","Grass","Dirt","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Wall","Grass","Grass","Dirt","Dirt","Water"],["Wall","Dirt","Dirt","Grass","Grass","Wall","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Wall","Dirt","Grass","Dirt","Water","Water"],["Water","Dirt","Grass","Dirt","Grass","Wall","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Wall","Grass","Grass","Dirt","Water","Water"],["Water","Dirt","Grass","Grass","Dirt","Wall","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Wall","Grass","Dirt","Dirt","Water","Water"],["Water","Dirt","Dirt","Dirt","Dirt","Wall","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Wall","Grass","Dirt","Dirt","Water","Water"],["Water","Dirt","Dirt","Dirt","Dirt","Wall","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Wall","Dirt","Dirt","Dirt","Water","Water"],["Water","Water","Dirt","Dirt","Dirt","Wall","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Wall","Dirt","Dirt","Dirt","Water","Water"],["Water","Water","Water","Dirt","Dirt","Wall","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Grass","Wall","Dirt","Dirt","Dirt","Water","Water"],["Water","Water","Water","Dirt","Dirt","Wall","Wall","Wall","Wall","Wall","Wall","Wall","Wall","Wall","Wall","Wall","Wall","Wall","Wall","Wall","Dirt","Dirt","Dirt","Water","Water"],["Water","Water","Water","Water","Dirt","Dirt","Dirt","Dirt","Dirt","Dirt","Dirt","Dirt","Dirt","Dirt","Dirt","Dirt","Dirt","Dirt","Dirt","Dirt","Dirt","Dirt","Water","Water","Water"],["Water","Water","Water","Water","Water","Water","Water","Water","Water","Water","Water","Water","Water","Water","Water","Water","Water","Water","Water","Water","Water","Water","Water","Water","None"],["Water","Water","Water","Water","Water","Water","Water","Water","Water","Water","Water","Water","Water","Water","Water","Water","Water","Water","Water","Water","Water","Water","Water","None","None"],["None","Water","Water","Water","Water","Water","Water","Water","Water","Water","Water","Water","Water","Water","Water","Water","Water","Water","Water","None","None","None","None","None","None"]]'
)
;