const db = require('../db');
const express = require('express')
const router = express.Router()
const uuid = require('uuid');

/**
 * @swagger
 * /api/user/test:
 *   get:
 *     tags:
 *       - 用户相关
 *     summary: 获取所有用户
 *     description: 从数据库返回所有的用户列表
 *     responses:
 *       200:
 *         description: 成功返回所有用户列表
 */
router.get('/test', (req, res) => {
    db.query('select * from user', (err, results) => {
        res.json(results)
    })
})

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     tags:
 *       - 用户相关
 *     summary: 用户登录
 *     description: 用户登录
 *     requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   description: 用户名
 *                   example: hyperyz
 *                 password:
 *                   type: string
 *                   description: 密码
 *                   example: 123
 *     responses:
 *       200:
 *         description: 登录成功
 */
router.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const checkLoginQuery = `SELECT * FROM user WHERE username = '${username}' AND password = '${password}'`;
    db.query(checkLoginQuery, (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            res.json({ msg: '登录成功' });
        } else {
            res.json({ msg: '用户名或密码错误' });
        }
    });
})


/**
 * @swagger
 * /api/user/register:
 *   post:
 *     tags:
 *       - 用户相关
 *     summary: 用户注册
 *     description: 用户注册
 *     requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   description: 用户名
 *                   example: hyperyz
 *                 password:
 *                   type: string
 *                   description: 密码
 *                   example: 123
 *     responses:
 *       200:
 *         description: 注册成功
 */
router.post('/register', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const checkUsernameQuery = `SELECT * FROM user WHERE username = '${username}'`;

    db.query(checkUsernameQuery, (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            res.json({ msg: '用户名已存在' })
        } else {
            const user_id = uuid.v4();
            const insertUserQuery = `INSERT INTO user (user_id,username, password) VALUES ('${user_id}','${username}', '${password}')`;
            db.query(insertUserQuery, (err, result) => {
                if (err) throw err;
                res.json({ msg: '注册成功' })
            });
        }
    });
})



module.exports = router