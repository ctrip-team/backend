const pool = require('../db');
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const { secret } = require('../config/')
let checkTokenMiddleware = require('../middlewares/checkTokenMiddleware')
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
    const checkLoginQuery = `SELECT * FROM role WHERE username = '${username}' AND password = '${password}'`;
    try {
        const db = await pool.getConnection()
        const [results, _] = await db.query(checkLoginQuery)
        if (results.length > 0) {
            res.json({ msg: '登录成功', code: 2000, role: results[0], token: jwt.sign({ username, password }, secret, { expiresIn: 60 * 10 }) });
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
 * /api/role/register:
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
router.post('/register', checkTokenMiddleware, async (req, res) => {
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

/**
 * @swagger
 * /api/role/delete:
 *   post:
 *     tags:
 *       - 审核员相关
 *     summary: 删除审核员
 *     description: 删除审核员
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
 *     responses:
 *       200:
 *         description: 删除成功
 */
router.post('/delete', checkTokenMiddleware, async (req, res) => {
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

/**
 * @swagger
 * /api/role/update:
 *   post:
 *     tags:
 *       - 审核员相关
 *     summary: 更新审核员信息
 *     description: 更新审核员信息
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
 *                 role:
 *                   type: string
 *                   description: 角色
 *                   example: 管理员
 *                 role_id:
 *                   type: string
 *                   description: id
 *                   example: 1111
 *     responses:
 *       200:
 *         description: 更新成功
 */
router.post('/update', checkTokenMiddleware, async (req, res) => {
    const { username, role, password, role_id } = req.body
    const sql = `UPDATE role SET username = ?, is_admin = ?, password = ? WHERE role_id = ?;`;
    const is_admin = role === '管理员' ? 1 : 0
    try {
        const db = await pool.getConnection()
        await db.query(sql, [username, is_admin, password, role_id])
        db.release()
        res.json({ msg: '编辑成功' });
    } catch (error) {
        console.error(error);
    }

})

/**
 * @swagger
 * /api/role/getRoles/{start}/{num}:
 *   get:
 *     tags:
 *       - 审核员相关
 *     summary: 获取指定数量的审核员信息
 *     description: 从start开始读取num个审核员信息
 *     parameters:
 *       - in: path
 *         name: start
 *         required: true
 *         schema:
 *           type: integer
 *         description: 起始位置
 *       - in: path
 *         name: num
 *         required: true
 *         schema:
 *           type: integer
 *         description: 返回角色的数量
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get('/getRoles/:start/:num', checkTokenMiddleware, async (req, res) => {
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

/**
 * @swagger
 * /api/role/getTop:
 *   get:
 *     tags:
 *       - 审核员相关
 *     summary: 获取审核量最高的5位审核员信息
 *     description: 获取审核量最高的5位审核员信息
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get('/getTop', checkTokenMiddleware, async (req, res) => {
    const sql = `SELECT * FROM role ORDER BY review_count DESC LIMIT 5;`;
    try {
        const db = await pool.getConnection()
        const [results] = await db.query(sql)
        db.release()
        res.json({ msg: '获取成功', tops: results })
    } catch (error) {
        console.error(error);
    }
})

module.exports = router