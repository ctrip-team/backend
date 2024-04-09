const pool = require('../db');
const express = require('express')
const router = express.Router()
const fs = require('fs').promises
const crypto = require('crypto');
const path = require('path')
const uuid = require('uuid');
const multer = require('multer');
const uploadAvatar = multer({ dest: path.join(__dirname, '../uploads/avatars') })
/**
 * @swagger
 * /api/user/test:
 *   get:
 *     tags:
 *       - 用户
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
 *       - 用户
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
 *       - 用户
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

/**
 * @swagger
 * /api/user/getById:
 *   post:
 *     tags:
 *       - 用户
 *     summary: 根据id获取用户信息
 *     description: 根据id获取用户信息
 *     requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: string
 *                   description: 用户id
 *                   example: 123
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.post('/getById', async (req, res) => {
    const { user_id } = req.body
    const sql = `SELECT * FROM user WHERE user_id = ?`;
    try {
        const db = await pool.getConnection()
        const [user] = await db.query(sql, [user_id]);
        db.release()
        res.json({ user: user[0] });

    } catch (error) {
        console.error(error);
    }
})

/**
 * @swagger
 * /api/user/update:
 *   post:
 *     summary: 更新用户信息和头像
 *     tags:
 *          - 用户
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: 用户名
 *               password:
 *                 type: string
 *                 description: 密码
 *               userId:
 *                 type: string
 *                 description: 用户ID
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: 头像文件
 *     responses:
 *       200:
 *         description: 更新成功
 */
router.post('/update', uploadAvatar.single('avatar'), async (req, res) => {
    const { username, password, userId } = req.body;
    const avatarFile = req.file;
    const ext = avatarFile.originalname.split('.')[1]
    const checkUserQuery = `SELECT * FROM user WHERE user_id = ?`;
    const updateUserQuery = `UPDATE user SET username = ?, password = ?, avatar = ? WHERE user_id = ?`;
    try {
        const db = await pool.getConnection()
        // const [existingUsers] = await db.query(checkUserQuery, [userId]);
        const data = await fs.readFile(avatarFile.path);
        const md5Hash = crypto.createHash('md5').update(data).digest('hex');
        const newPath = `${process.env.BASE_URL}/avatars/${md5Hash}.${ext}`
        await fs.writeFile(`uploads/avatars/${md5Hash}.${ext}`, data);
        await fs.unlink(avatarFile.path);
        await db.query(updateUserQuery, [username, password, newPath, userId])
        const [newUser] = await db.query(checkUserQuery, [userId])
        db.release()
        res.json({ msg: '更新成功', user: newUser[0] });
    } catch (error) {
        console.error(error);
    }
})

/**
 * @swagger
 * /api/user/updateInfo:
 *   post:
 *     tags:
 *       - 用户
 *     summary: 仅更新用户信息
 *     description: 仅更新用户信息
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
 *         description: 更新成功
 */
router.post('/updateInfo', async (req, res) => {
    const { username, password, userId } = req.body;
    const checkUserQuery = `SELECT * FROM user WHERE user_id = ?`;
    const updateUserQuery = `UPDATE user SET username = ?, password = ? WHERE user_id = ?`;
    try {
        const db = await pool.getConnection()
        const [existingUsers] = await db.query(checkUserQuery, [userId]);
        await db.query(updateUserQuery, [username, password, userId])
        const [newUser] = await db.query(checkUserQuery, [userId])
        db.release()
        res.json({ msg: '更新成功', user: newUser[0] });
    } catch (error) {
        console.error(error);
    }
})

module.exports = router