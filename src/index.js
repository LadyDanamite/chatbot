import express from "express"
import mustacheExpress from "mustache-express"
import {nanoid} from "nanoid"
import cookieParser from "cookie-parser"
import requireValidSession from "./middleware/requireValidSession.js"
import initdb from "./helpers/databaseHelper.js"
import chatClient from "./helpers/openaiHelper.js"

const app = express()
const port = 3000
const db = initdb()

app.locals.db = db

//setting up express to use mustache engine
app.engine('mst', mustacheExpress());
app.set('view engine', 'mst');
app.set('views', './src/views');

app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(express.static('public'));
app.use(express.json())

//testing mustache 
app.get("/",(req,res)=>{
    res.render("index",{name: "Joe", title: "My Chatbot App"})
})

app.get("/signup",(req,res)=>{
    res.render("signup")
})

//create login
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

//credential check and assign sessionid and cookie
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
                //if login is correct assign session id
                const sessionid = nanoid(10)
                const sessionsql = `INSERT INTO sessions (session_id, user_id, expires_at) 
                                    VALUES ('${sessionid}', ${row.id}, DATETIME('now', '+1 hour'));`
                                    console.log(sessionsql)
                db.run(sessionsql,(err)=>{
                    if (err) {
                        console.error(err)
                        return res.status(500).render("index", {error: "Failed to create session"})
                        }
                    console.log(sessionid)
                })
                //create cookie
                return res.cookie("sessionid", sessionid, {httpOnly: true})
                    .cookie("userid", row.id)
                    .redirect("/home")
            }
            return res.status(401).render("index", {error: "Username or password incorrect"})
               
    })
})

app.post("/chat",requireValidSession,async(req,res)=>{
    const response = await chatClient.responses.create({
        input: req.body.message,
        model: "gpt-4.1-nano"
    })
    console.log(response)
    return res.send(response.output_text)
})

//check session is valid
app.get("/home", requireValidSession,(req,res)=>{
    return res.render("home")
})

app.post("/logout",(req,res)=>{
    res.clearCookie("sessionid").clearCookie("userid").redirect("/")
})

app.listen(port,()=>{
    console.log("Chatbot listening on port:" + port)
})

