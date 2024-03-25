const db = require('../db');
const express = require('express')
const router = express.Router()

router.get('/people', (req, res) => {
    db.query('select * from user', (err, results) => {
        res.json(results)
    })
})

module.exports = router