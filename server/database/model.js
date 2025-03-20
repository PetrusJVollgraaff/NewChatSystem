const Database = require("better-sqlite3");
const db = new Database("mydatabase.db");

db.exec(`
    CREATE TABLE IF NOT EXISTS users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        activeYN  VARCHAR(3) DEFAULT 'yes',
        deletedYN VARCHAR(3) DEFAULT 'no'
    );
    
    CREATE TABLE IF NOT EXISTS userdetails(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_media_id INTEGER DEFAULT NULL,
        bg_media_id INTEGER DEFAULT NULL,
        email TEXT,
        displayname TEXT, 
        deletedYN VARCHAR(3) DEFAULT 'no',
        FOREIGN KEY(profile_media_id) REFERENCES mediaused (id),
        FOREIGN KEY(bg_media_id) REFERENCES mediaused (id)
    );

    CREATE TABLE IF NOT EXISTS rooms(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS one_one(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        receiver_id INTEGER,
        sender_id INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(receiver_id) REFERENCES users(id),
        FOREIGN KEY(sender_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS room_one(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        receiver_id INTEGER,
        room_id INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        activeYN  VARCHAR(3) DEFAULT 'yes',
        FOREIGN KEY(receiver_id) REFERENCES users(id),
        FOREIGN KEY(room_id) REFERENCES rooms(id)
    );

    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        room_id INTEGER DEFAULT NULL,
        chat_id INTEGER DEFAULT NULL,
        content TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        deletedYN VARCHAR(3) DEFAULT 'no',
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(room_id) REFERENCES rooms(id),
        FOREIGN KEY(chat_id) REFERENCES one_one(id)
    );

    CREATE TABLE IF NOT EXISTS modules(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        modulename TEXT UNIQUE NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS mediaused(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        modules_id INTEGER,
        media_id INTEGER DEFAULT NULL,
        doc_id INTEGER DEFAULT NULL,
        assigned_id INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        deletedYN VARCHAR(3) DEFAULT 'no',
        FOREIGN KEY(modules_id) REFERENCES messages(id),
        FOREIGN KEY(media_id) REFERENCES medias (id),
        FOREIGN KEY(doc_id) REFERENCES documents (id)
    );

    CREATE TABLE IF NOT EXISTS medias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT, 
        type TEXT,
        path TEXT,
        thumbnail TEXT DEFAULT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        deletedYN VARCHAR(3) DEFAULT 'no',
        FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT, 
        type TEXT,
        path TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        deletedYN VARCHAR(3) DEFAULT 'no',
        FOREIGN KEY(user_id) REFERENCES users(id)
    );
`);

db.prepare(
  `INSERT OR IGNORE INTO modules (modulename) VALUES ('Profile'), ('Messages')`
).run();

module.exports = db;
