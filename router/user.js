const pool = require('../db');
const express = require('express')
const router = express.Router()
const uuid = require('uuid');

/**
 * @swagger
 * /api/user/test:
 *   get:
 *     tags:
 *       - 用户相关
 *     summary: 获取所有用户（测试接口，看连接是否正常）
 *     description: 从数据库返回所有的用户列表
 *     responses:
 *       200:
 *         description: 成功返回所有用户列表
 */
router.get('/test', async (req, res) => {
    try {
        const db = await pool.getConnection()
        const [results, _] = await db.query('SELECT * FROM user');
        db.release()
        res.json(results);
    } catch (error) {
        console.error(error);
    }
});


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
router.post('/login', async (req, res) => {
    const { username, password } = req.body
    const sql = `SELECT * FROM user WHERE username = '${username}' AND password = '${password}'`;
    try {
        const db = await pool.getConnection()
        const [results, _] = await db.query(sql);
        db.release()
        if (results.length > 0) {
            res.json({ msg: '登录成功' });
        } else {
            res.json({ msg: '用户名或密码错误' });
        }
    } catch (error) {
        console.error(error);
    }
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
router.post('/register', async (req, res) => {
    const { username, password } = req.body
    const sql = `SELECT * FROM user WHERE username = '${username}'`;
    try {
        const db = await pool.getConnection()
        const [results, _] = await db.query(sql);
        let msg
        if (results.length > 0) {
            msg = '用户名已存在'
        } else {
            const user_id = uuid.v4();
            const insertUserQuery = `INSERT INTO user (user_id,username, password) VALUES ('${user_id}','${username}', '${password}')`;
            await db.query(insertUserQuery)
            msg = '注册成功'
        }
        db.release()
        res.json({ msg });

    } catch (error) {
        console.error(error);
    }
})



module.exports = router