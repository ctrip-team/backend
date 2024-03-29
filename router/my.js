const db = require('../db');
const express = require('express')
const router = express.Router()


router.get('/mytravals', (req, res) => {
  const { user_id } = req.query
  db.query(`SELECT * FROM travals, user WHERE travals.user_id=user.user_id AND travals.user_id=${user_id}; `, (err, results) => {
    res.json(results)
  })
})

router.post('/deltravals', (req, res) => {
  const { id } = req.body
  db.query(`DELETE FROM travals WHERE id=${id}; `, (err, results) => {
    res.json(results)
  })
})

module.exports = router