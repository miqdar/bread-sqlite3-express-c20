const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')

const sqlite3 = require('sqlite3').verbose()
const dbfile = __dirname + "/db/c20.db"
const db = new sqlite3.Database(dbfile, sqlite3.OPEN_READWRITE);

const app = express()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'client')))


app.get('/', (req, res) => {
    let countData = `SELECT COUNT(id) AS jlhData FROM satu`;
    db.get(countData, (err, hasil) => {
        if (err) res.send(err)
        var jumlahData = Math.ceil(hasil.jlhData / 3)

        let sql = `SELECT * FROM satu LIMIT 0,3`;
        db.all(sql, (err, rows) => {
            if (err) return res.send(err)
            res.render('index', { data: rows, jumlahData })
        })
    })
})

app.get('/add', (req, res) => res.render('add'))
app.get('/filter', (req, res) => {
    let pilihanTrue = "AA"
    res.render('filter', { pilihanTrue })
})
app.get('/result-filter', (req, res) => res.render('result-filter'))
app.get('/:id', (req, res) => {
    let countData = `SELECT COUNT(id) AS jlhData FROM satu`;
    db.get(countData, (err, hasil) => {
        if (err) res.send(err)
        let batas = 3;
        var jumlahData = Math.ceil(hasil.jlhData / batas)
        let posisi = (req.params.id - 1) * batas;
        let sql = `SELECT * FROM satu LIMIT ${posisi}, ${batas}`;

        db.all(sql, (err, rows) => {
            if (err) return res.send(err)
            res.render('index', { data: rows, jumlahData })
        })
    })
})


app.post('/add', (req, res) => {
    let sql = `INSERT INTO satu (string, integer, float, date, boolean) VALUES ('${req.body.string}','${req.body.integer}','${req.body.float}','${req.body.date}','${req.body.boolean}')`;
    db.run(sql, (err) => {
        if (err) return res.send(err)
    })
    res.redirect('/')
})

app.get('/edit/:id', (req, res) => {
    let sql = `SELECT * FROM satu WHERE id= ${req.params.id}`;
    db.all(sql, (err, rows) => {
        if (err) return res.send(err)
        if (rows.boolean === "true") {
            var pilihanTrue = "selected"
        } else { var pilihanFalse = "selected" }
        res.render('edit', { data: rows[0], pilihanTrue, pilihanFalse })
    })
})
app.post('/edit/:id', (req, res) => {
    let sql = `UPDATE satu SET string= '${req.body.string}', integer = '${req.body.integer}', float= '${req.body.float}', date= '${req.body.date}', boolean= '${req.body.boolean}' WHERE id= ${req.params.id}`;
    db.run(sql, (err) => {
        if (err) return res.send(err)
    })
    res.redirect('/')
})

app.post('/filter', (req, res) => {
    var string = "!?"
    var integer = "!?"
    var float = "!?"
    var boolean = "!?"
    if (req.body.stringChooice === "on") {
        string = req.body.string
    }
    if (req.body.integerChooice === "on") {
        integer = req.body.integer
    }
    if (req.body.floatChooice === "on") {
        float = req.body.float
    }
    if (req.body.booleanChooice === "on") {
        boolean = req.body.boolean
    }
    sql = `SELECT * FROM satu WHERE string = '${string}' OR integer = '${integer}' OR float = '${float}' OR boolean = '${boolean}'`;
    if (req.body.dateChooice === "on") {
        sql = `SELECT * FROM satu WHERE string = '${string}' OR integer = '${integer}' OR float = '${float}' OR boolean = '${boolean}' OR date >= '${req.body.startDate}' AND date <= '${req.body.endDate}'`;
    }
    db.all(sql, (err, rows) => {
        if (err) return res.send(err)
        res.render('result-filter', { data: rows })
    })
})

app.get('/delete/:id', (req, res) => {
    let sql = `DELETE FROM satu WHERE id = ${req.params.id}`;
    db.run(sql, (err) => {
        if (err) return res.send(err)
        res.redirect('/')
    })
})

app.listen(3000, () => {
    console.log('web jalan di 3000')
})

