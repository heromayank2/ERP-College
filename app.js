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
    "password": "",
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

app.get('/dashboard', (req, res) => {
    return res.render('dashboard')
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
            return res.render("dashboard", { user })
        }
        return res.send(404)
    })
})

app.post('/tlogin', (req, res) => {
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
            return res.render("dashboard", { user })
        }
        return res.send(404)
    })
})

app.get('/assignments/:sid', (req, res) => {
    var sid = req.params.sid
    let query = "SELECT * FROM student WHERE ID = '" + sid + "'"
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
    let query = "SELECT * FROM student WHERE ID = '" + sid + "'"
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
    let query = "SELECT * FROM student WHERE ID = '" + sid + "'"
    connection.query(query, (error, rows, fields) => {
        var user = rows[0]
        connection.query("SELECT * FROM professor", (error, rows, fields) => {
            var professors = rows
            return res.render("professor", { professors, user })
        })
    })
})

app.use("/", express.static(__dirname + '/assets/'));

app.listen(4000, console.log("Listening on PORT " + PORT));