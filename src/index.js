import express from "express"
import mustacheExpress from "mustache-express"
import sqlite3 from "sqlite3"
import {nanoid} from "nanoid"
import cookieParser from "cookie-parser"
import requireValidSession from "./middleware/requireValidSession.js"

const app = express()
const port = 3000
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

app.locals.db = db

//setting up express to use mustache engine
app.engine('mst', mustacheExpress());
app.set('view engine', 'mst');
app.set('views', './src/views');

app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

app.get("/",(req,res)=>{
    res.render("index",{name: "Joe", title: "My Chatbot App"})
})

app.get("/signup",(req,res)=>{
    res.render("signup")
})

app.get("/login",(req,res)=>{
    res.render("login")
})

app.post("/signup",(req,res)=>{
    console.log(req.body)
    const sql = `INSERT INTO users (username, password) VALUES ('${req.body.username}', '${req.body.password}')`
    db.run(sql,(err)=>{
        if (err) {
            console.error(err)
            return res.status(400).send("Signup failed")
        }
        res.send("Signup successful")
    })
})

app.post("/login",(req,res)=>{
    const sql =`SELECT COUNT(*) AS total, id
    FROM users 
    WHERE username = '${req.body.username}' 
    AND password = '${req.body.password}';
    `
    db.get(sql,(err, row)=>{
        if (err) {
            console.error(err)
            return res.status(400).send("Login failed")
            }
            console.log(row)
            if (row.total == 1){
                const sessionid = nanoid(10)
                const sessionsql = `INSERT INTO sessions (session_id, user_id, expires_at) 
                                    VALUES ('${sessionid}', ${row.id}, DATETIME('now', '+1 hour'));`
                                    console.log(sessionsql)
                db.run(sessionsql,(err)=>{
                    if (err) {
                        console.error(err)
                        return res.status(500).render("login", {error: "Failed to create session"})
                        }
                    console.log(sessionid)
                })
                return res.cookie("sessionid", sessionid, {httpOnly: true})
                    .cookie("userid", row.id)
                    .redirect("/home")
            }
            return res.status(401).render("login", {error: "Username or password incorrect"})
               
    })
})

app.get("/home", requireValidSession,(req,res)=>{
    return res.render("home")
})



app.listen(port,()=>{
    console.log("Chatbot listening on port:" + port)
})

