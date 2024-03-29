const pool = require('../db');
const express = require('express')
const router = express.Router()

/**
 * @swagger
 * /api/role/login:
 *   post:
 *     tags:
 *       - 审核员相关
 *     summary: 审核员登录
 *     description: 审核员登录
 *     requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   description: 审核员账号
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
    const checkLoginQuery = `SELECT * FROM reviewer WHERE username = '${username}' AND password = '${password}'`;
    try {
        const db = await pool.getConnection()
        const [results, _] = await db.query(checkLoginQuery)
        if (results.length > 0) {
            res.json({ msg: '登录成功', code: 2000, review_id: results[0].reviewer_id });
        } else {
            res.json({ msg: '用户名或密码错误', code: 2001 });
        }
        db.release()
    } catch (error) {
        console.error(error);
    }
})

/**
 * @swagger
 * /api/reviewer/register:
 *   post:
 *     tags:
 *       - 审核员相关
 *     summary: 审核员注册
 *     description: 审核员注册
 *     requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   description: 审核员账号
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
    const { username, password, role } = req.body
    const is_admin = role === '审核员' ? 0 : 1
    const sql = `SELECT * FROM role WHERE username = '${username}'`;

    try {
        const db = await pool.getConnection()
        let msg
        const [results, _] = await db.query(sql)
        if (results.length > 0) {
            msg = '用户名已存在'
        } else {
            const insertUserQuery = `INSERT INTO role (username, password, is_admin) VALUES ('${username}', '${password}', '${is_admin}')`;
            await db.query(insertUserQuery)
            msg = '注册成功'
        }
        res.json({ msg })
        db.release()
    } catch (error) {
        console.error(error);
    }
})

router.post('/delete', async (req, res) => {
    const { username } = req.body
    const sql = `DELETE FROM role WHERE username = ?`;

    try {
        const db = await pool.getConnection()
        await db.query(sql, [username])
        db.release()
        res.json({ msg: '用户删除成功' });
    } catch (error) {
        console.error(error);
    }

})


router.get('/getRoles/:start/:num', async (req, res) => {
    const { start, num } = req.params

    const sql = `SELECT * FROM role LIMIT ${parseInt(start)}, ${parseInt(num)}`;

    try {
        const db = await pool.getConnection()
        const [results, _] = await db.query(sql)
        db.release()
        if (results.length > 0) {
            res.json({ code: 2000, msg: '获取成功', roles: results })
        } else {
            res.json({ code: 2001, msg: '全部加载完毕' })
        }
    } catch (error) {
        console.error(error);
    }

})

module.exports = router