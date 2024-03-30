const pool = require('../db');
const express = require('express')
const router = express.Router()

/**
 * @swagger
 * /index:
 *   get:
 *     tags:
 *       - 我的游记内容
 *     summary: 获取全部我的游记信息
 *     description: 从数据库返回我的全部游记信息
 *     responses:
 *       200:
 *         description: 成功返回游记信息
 */
// , user WHERE travels.user_id=user.user_id;
router.get('/mytravels', async (req, res) => {
  const { user_id } = req.query
  const selectMyTravals = `SELECT * FROM travel,user,image WHERE travel.user_id=user.user_id AND travel.travel_id=image.travel_id AND travel.user_id=${user_id}`
  try {
    const db = await pool.getConnection()
    const [results, _] = await db.query(selectMyTravals)
    if (results.length > 0) {
      res.json({ msg: '查询成功', code: 2000, data: results });
    } else {
      res.json({ msg: '查询失败', code: 2001 });
    }
    db.release()
  } catch (error) {
    console.error(error);
  }
})

/**
 * @swagger
 * /index:
 *   get:
 *     tags:
 *       - 删除游记
 *     summary: 删除指定游记
 *     description: 从数据库删除指定的游记信息
 *     responses:
 *       200:
 *         description: 成功删除指定游记信息
 */
// , user WHERE travels.user_id=user.user_id;
router.post('/deltravel', async (req, res) => {
  const { travel_id } = req.body
  const deleteTraval = `DELETE FROM travel WHERE travel_id=${travel_id}`
  try {
    const db = await pool.getConnection()
    const [results, _] = await db.query(deleteTraval)
    if (results.affectedRows > 0) {
      res.json({ msg: '删除成功', code: 2000 });
    } else {
      res.json({ msg: '删除失败', code: 2001 });
    }
    db.release()
  } catch (error) {
    console.error(error);
  }
})


/**
 * @swagger
 * /index:
 *   get:
 *     tags:
 *       - 用户端注册
 *     summary: 用户端用户注册
 *     description: 将用户输入的用户名和密码信息存储到数据库中
 *     responses:
 *       200:
 *         description: 成功注册
 */
// , user WHERE travels.user_id=user.user_id;
// router.post('/register', async (req, res) => {
//   const { username, password } = req.body
//   const deleteTraval = `UPDATE user SET user`
//   try {
//     const db = await pool.getConnection()
//     const [results, _] = await db.query(deleteTraval)
//     if (results.affectedRows > 0) {
//       res.json({ msg: '删除成功', code: 2000 });
//     } else {
//       res.json({ msg: '删除失败', code: 2001 });
//     }
//     db.release()
//   } catch (error) {
//     console.error(error);
//   }
// })


/**
 * @swagger
 * /index:
 *   get:
 *     tags:
 *       - 用户端登录
 *     summary: 用户端用户登录
 *     description: 将用户输入的用户名和密码信息到数据库中进行比对，并返回比对成功的用户信息
 *     responses:
 *       200:
 *         description: 成功登录
 */
// , user WHERE travels.user_id=user.user_id;
router.post('/login', async (req, res) => {
  const { username, password } = req.body
  const matchUser = `SELECT * FROM user WHERE username='${username}' AND password='${password}'`
  try {
    const db = await pool.getConnection()
    const [results, _] = await db.query(matchUser)
    if (results.length > 0) {
      res.json({ msg: '登录成功', code: 2000, data: results });
    } else {
      res.json({ msg: '登录失败', code: 2001 });
    }
    db.release()
  } catch (error) {
    console.error(error);
  }
})

module.exports = router