const db = require('../db');
const express = require('express')
const router = express.Router()

/**
 * @swagger
 * /people:
 *   get:
 *     tags:
 *       - 用户相关
 *     summary: 获取所有用户
 *     description: 从数据库返回所有的用户列表
 *     responses:
 *       200:
 *         description: 成功返回所有用户列表
 */
router.get('/people', (req, res) => {
    db.query('select * from user', (err, results) => {
        res.json(results)
    })
})

module.exports = router