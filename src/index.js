import express from "express"
import mustacheExpress from "mustache-express"
import sqlite3 from "sqlite3"

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

app.locals.db = db

//setting up express to use mustache engine
app.engine('mst', mustacheExpress());
app.set('view engine', 'mst');
app.set('views', './src/views');

app.use(express.urlencoded({extended:true}))

app.get("/",(req,res)=>{
    res.render("index",{name: "Joe", title: "My Chatbot App"})
})

app.get("/signup",(req,res)=>{
    res.render("signup")
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

app.listen(port,()=>{
    console.log("Chatbot listening on port:" + port)
})

