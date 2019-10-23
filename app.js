var express = require('express')
var mysql = require('mysql')
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const BodyParser = require('body-parser')

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
const PORT = process.env.PORT || 1337;

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
    connection.query("SELECT * FROM student", (err, rows, fields) => {
        return res.send(rows)
    })
})

app.get('/login', (req, res) => {
    return res.render('login')
})

app.post('/login', (req, res) => {
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

app.use("/", express.static(__dirname + '/assets/'));

app.listen(PORT, console.log("Listening on PORT " + PORT));