var express = require('express')
var mysql = require('mysql')
var jwt = require('jsonwebtoken')
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const BodyParser = require('body-parser');


var app = express()
app.use(expressLayouts)
app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    })
);
const PORT = process.env.PORT || 4000;

var connection = mysql.createConnection({
    "host": "localhost",
    "user": "root",
    "password": "1701",
    "database": "erp"
})

connection.connect((err) => {
    if (err) {
        console.log("Error in Connecting to Database ", err)
    } else {
        console.log("Connected to Database")
    }
})

app.get('/', (req, res) => {
    return res.render('choose')
})

app.get('/student/login', (req, res) => {
    return res.render('slogin')
})

app.get('/teacher/login', (req, res) => {
    return res.render('tlogin')
})

app.post('/dashboard', (req, res) => {
    const { sid, password } = req.body
    let query = "SELECT * FROM student"
    connection.query(query, (err, rows, fields) => {
        i = 0
        for (; i < rows.length; i++) {
            if (rows[i].ID == sid) {
                break
            }
        }
        if (rows[i].password == password) {
            var user = rows[i]
            return res.redirect("/dashboard/" + user.SID + "/")
        }
        return res.sendStatus(404)
    })
})

app.post('/teacher/dashboard', (req, res) => {
    const { id, password } = req.body
    let query = "SELECT * FROM professor"
    connection.query(query, (err, rows, fields) => {
        i = 0
        for (; i < rows.length; i++) {
            if (rows[i].ID == id) {
                break
            }
        }
        if (rows[i].Password == password) {
            var user = rows[i]
            return res.redirect("/teacher/dashboard/" + user.PID + "/")
        }
        return res.sendStatus(404)
    })
})


app.get('/dashboard/:sid', (req, res) => {
    var sid = req.params.sid
    let query = "SELECT * FROM student WHERE SID = '" + sid + "'"
    connection.query(query, (error, rows, fields) => {
        var user = rows[0]
        connection.query("SELECT * FROM assignment", (error, rows, fields) => {
            var assignments = rows
            connection.query("SELECT * FROM announcements", (error, rows, fields) => {
                var announcements = rows
                return res.render("dashboard", { assignments, user, announcements })
            })
        })
    })
})

app.get('/teacher/dashboard/:pid', (req, res) => {
    var pid = req.params.pid
    let query = "SELECT * FROM professor WHERE PID = '" + pid + "'"
    connection.query(query, (error, rows, fields) => {
        var user = rows[0]
        return res.render("teacher-dashboard", { user })
    })
})

app.get('/assignments/:sid', (req, res) => {
    var sid = req.params.sid
    let query = "SELECT * FROM student WHERE SID = '" + sid + "'"
    connection.query(query, (error, rows, fields) => {
        var user = rows[0]
        connection.query("SELECT * FROM assignment", (error, rows, fields) => {
            var assignments = rows
            return res.render("assignment", { assignments, user })
        })
    })
})


app.get('/events/:sid', (req, res) => {
    var sid = req.params.sid
    let query = "SELECT * FROM student WHERE SID = '" + sid + "'"
    connection.query(query, (error, rows, fields) => {
        var user = rows[0]
        connection.query("SELECT * FROM events", (error, rows, fields) => {
            var events = rows
            return res.render("events", { events, user })
        })
    })
})

app.get('/professors/:sid', (req, res) => {
    var sid = req.params.sid
    let query = "SELECT * FROM student WHERE SID = '" + sid + "'"
    connection.query(query, (error, rows, fields) => {
        var user = rows[0]
        connection.query("SELECT * FROM professor", (error, rows, fields) => {
            var professors = rows
            return res.render("professor", { professors, user })
        })
    })
})

app.get('/library/:sid', (req, res) => {
    var sid = req.params.sid
    let query = "SELECT * FROM student WHERE SID = '" + sid + "'"
    connection.query(query, (error, rows, fields) => {
        var user = rows[0]
        connection.query("SELECT * FROM library", (error, rows, fields) => {
            var books = rows
            return res.render("library", { books, user })
        })
    })
})

app.get('/library/search/bookid/:sid/:bid', (req, res) => {
    var sid = req.params.sid
    let query = "SELECT * FROM student WHERE SID = '" + sid + "'"
    connection.query(query, (error, rows, fields) => {
        var user = rows[0]
        var bid = req.params.bid
        connection.query("SELECT * FROM library Where BookID='" + bid + "'", (error, rows, fields) => {
            var books = rows
            return res.render("library", { books, user })
        })
    })
})

app.get('/library/search/booktitle/:sid/:bt', (req, res) => {
    var sid = req.params.sid
    let query = "SELECT * FROM student WHERE SID = '" + sid + "'"
    connection.query(query, (error, rows, fields) => {
        var user = rows[0]
        var bt = req.params.bt
        connection.query("SELECT * FROM library Where BookTitle LIKE '%" + bt + "%'", (error, rows, fields) => {
            var books = rows

            return res.render("library", { books, user })
        })
    })
})

app.use('/books/:sid', (req, res) => {
    var sid = req.params.sid
    let query = "SELECT * FROM student WHERE SID = '" + sid + "'"
    connection.query(query, (error, rows, fields) => {
        var user = rows[0]
        connection.query("SELECT * FROM library Where IssuedTo ='" + user.ID + "'", (error, rows, fields) => {
            var books = rows
            return res.render("books", { books, user })
        })
    })
})

app.use('/attendence/:sid', (req, res) => {
    var sid = req.params.sid
    let query = "SELECT * FROM student WHERE SID = '" + sid + "'"
    connection.query(query, (error, rows, fields) => {
        var user = rows[0]
        connection.query("SELECT * FROM attendence Where SID ='" + user.ID + "'", (error, rows, fields) => {
            var attendence = rows
            console.log(attendence)
            return res.render("attendence", { attendence, user })
        })
    })
})

app.get('/results/:sid', (req, res) => {
    var sid = req.params.sid
    let query = "SELECT * FROM student WHERE SID = ?"
    connection.query(query, [sid], (error, rows, fields) => {
        var user = rows[0]
        connection.query("SELECT * FROM result Where SID =?", [user.ID], (error, rows, fields) => {
            var results = rows
            console.log(results)
            return res.render("results", { results, user })
        })
    })
})

app.get('/timetable/:sid', (req, res) => {
    var sid = req.params.sid
    let query = "SELECT * FROM student WHERE SID = '" + sid + "'"
    connection.query(query, (error, rows, fields) => {
        var user = rows[0]
        return res.render('timetable', { user })
    })
})

app.get('/create/assignment/:pid', (req, res) => {
    var pid = req.params.pid
    let query = "SELECT * FROM professor WHERE PID = ?"
    connection.query(query, [pid], (error, rows, fields) => {
        var user = rows[0]
        var create = "assignment"
        return res.render("create", { user, create })
    })
})


app.get('/create/event/:pid', (req, res) => {
    var pid = req.params.pid
    let query = "SELECT * FROM professor WHERE PID = ?"
    connection.query(query, [pid], (error, rows, fields) => {
        var user = rows[0]
        var create = "event"
        return res.render("create", { user, create })
    })
})

app.get('/upload/result/:pid', (req, res) => {
    var pid = req.params.pid
    let query = "SELECT * FROM professor WHERE PID = ?"
    connection.query(query, [pid], (error, rows, fields) => {
        var user = rows[0]
        var create = "result"
        return res.render("create", { user, create })
    })
})


app.get('/create/announcement/:pid', (req, res) => {
    var pid = req.params.pid
    let query = "SELECT * FROM professor WHERE PID = ?"
    connection.query(query, [pid], (error, rows, fields) => {
        var user = rows[0]
        var create = "announcement"
        return res.render("create", { user, create })
    })
})

app.get('/view/announcement/:pid', (req, res) => {
    var pid = req.params.pid
    let query = "SELECT * FROM professor WHERE PID = ?"
    connection.query(query, [pid], (error, rows, fields) => {
        var user = rows[0]
        var view = "announcement"
        connection.query("SELECT * FROM announcements", (error, rows, fields) => {
            var announcements = rows
            return res.render("view", { user, announcements, view })
        })

    })
})

app.get('/view/event/:pid', (req, res) => {
    var pid = req.params.pid
    let query = "SELECT * FROM professor WHERE PID = ?"
    connection.query(query, [pid], (error, rows, fields) => {
        var user = rows[0]
        var view = "event"
        connection.query("SELECT * FROM events", (error, rows, fields) => {
            var events = rows
            return res.render("view", { user, events, view })
        })

    })
})
app.get('/view/assignment/:pid', (req, res) => {
    var pid = req.params.pid
    let query = "SELECT * FROM professor WHERE PID =?"
    connection.query(query, [pid], (error, rows, fields) => {
        var user = rows[0]
        var view = "assignment"
        connection.query("SELECT * FROM assignment", (error, rows, fields) => {
            var assignments = rows
            return res.render("view", { user, assignments, view })
        })

    })
})

app.post('/create/announcement/:pid', (req, res) => {
    var pid = req.params.pid
    const { heading, cdate, edate, content, restriction } = req.body
    connection.query("INSERT INTO announcements (CreationDate,Heading,Content,ExpiryDate, Restrictions) VALUES (?,?,?,?,?);", [cdate, heading, content, edate, restriction], (error, rows, fields) => {
        if (error) {
            console.log(error)
        }
        return res.redirect("/create/announcement/" + pid)
    })
})
app.post('/create/assignment/:pid', (req, res) => {
    var pid = req.params.pid
    const { heading, deadline, content, year, batch } = req.body
    connection.query("INSERT INTO assignment (Year, Batch, PID, Deadline, Content, Heading) VALUES (?,?,?,?,?,?);", [year, batch, pid, deadline, content, heading], (error, rows, fields) => {
        if (error) {
            console.log(error);
        }
        return res.redirect("/create/assignment/" + pid)
    })
})
app.post('/create/event/:pid', (req, res) => {
    var pid = req.params.pid
    const { heading, date, description, iurl, eurl, time } = req.body
    connection.query("INSERT INTO events (Date, Heading, Description, ImageURLs, URL, Time) VALUES (?,?,?,?,?,?);", [date, heading, description, iurl, eurl, time], (error, rows, fields) => {
        if (error) {
            console.log(error);
        }
        return res.redirect("/create/event/" + pid)
    })
})
app.get('/view/attendance/:sid',(req,res)=>{
    var sid = req.params.sid
    // change the column and table names accordingly, here the value for absent is null
    connection.query("SELECT subject,COUNT(present),COUNT(*) FROM attendance GROUP BY subject;",(error,rows,fields)=>{
        if(error){
            console.log(error)
        }
        // do as required
        return res.render()
    })
})


// get request for result for teacher
app.get('/view/result/:pid/', (req, res) => {
    var pid = req.params.pid
    let query = "SELECT * FROM professor WHERE PID = ?"
    connection.query(query, [pid], (error, rows, fields) => {
        var user = rows[0];
        res.render("ask-student-id", { user })
    })
})

app.get('/view/result/single/:pid/', (req, res) => {
    var sid = req.query.sid;
    var pid = req.params.pid
    let query = "SELECT * FROM professor WHERE PID = ?"
    connection.query(query, [pid], (error, rows, fields) => {
        var user = rows[0];
        let query = "SELECT * FROM result WHERE SID = ?"
        connection.query(query, [sid], (error, rows, fields) => {
            var results = rows;
            let query = "SELECT * FROM student WHERE ID = ?"
            connection.query(query, [sid], (error, rows, fields) => {
                var student = rows[0]
                return res.render("teacher-result", { user, results, student })
            })

        })
    })
})

// YET TO BE MADE
app.get('/view/attendance/:sid', (req, res) => {
    var sid = req.params.sid
        // change the column and table names accordingly, here the value for absent is null
    connection.query("SELECT subject,COUNT(present),COUNT(*) FROM attendance GROUP BY subject;", (error, rows, fields) => {
        if (error) {
            console.log(error)
        }
        return res.render('teacher-attendance')
    })
})

app.use("/", express.static(__dirname + '/assets/'));

app.listen(4000, console.log("Listening on PORT " + PORT));