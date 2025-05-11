export default function requireValidSession (req,res,next){
    const sessionid = req.cookies.sessionid
    const userid = req.cookies.userid
    const db = req.app.locals.db
    if (!sessionid || !userid){
        return res.redirect(302,"login")
    }
    const sql =`SELECT COUNT(*) AS total
    FROM sessions 
    WHERE session_id = '${sessionid}' 
    AND user_id = '${userid}'
    AND expires_at > DATETIME('now');   
    `
    db.get(sql,(err,row)=>{
        if (err){
            console.error(err)
            return res.redirect(302, "login")
        }
        console.log(row)
            if (row.total == 0){
                return res.redirect(302,"login")
            }
        next()
    })
    
}
