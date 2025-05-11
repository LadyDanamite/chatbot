import sqlite3 from "sqlite3"

export default function initdb(){
    const db = new sqlite3.Database("data.sqlite",(err)=>{
    if (err) {
    console.error("Failed to open DB:", err);
    process.exit(1);
  }
  console.log("Opened SQLite database");
})

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT    NOT NULL UNIQUE,
      password TEXT    NOT NULL
    )`
  , (err) => {
    if (err) {
      console.error("Failed to create users table:", err);
      process.exit(1);
    }
    console.log("Ensured users table exists");
  });
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(128) PRIMARY KEY,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    expires_at TIMESTAMP, 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
)`
  , (err) => {
    if (err) {
      console.error("Failed to create session table:", err);
      process.exit(1);
    }
    console.log("Ensured session table exists");
  });
});
return db
}