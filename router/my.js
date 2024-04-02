const pool = require('../db');
const express = require('express')
const router = express.Router()
const axios = require('axios')

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
router.get('/mytravels', async (req, res) => {
  const { user_id } = req.query
  const selectMyTravals = `SELECT * FROM travel t JOIN user u ON t.user_id = u.user_id LEFT JOIN image i ON t.travel_id = i.travel_id WHERE t.status <> 4 AND t.user_id = '${user_id}' GROUP BY t.travel_id ORDER BY CASE WHEN t.status = '0' THEN '0' WHEN t.status = '1' THEN '1' ELSE '2' END, t.created_at DESC;`
  try {
    const db = await pool.getConnection()
    const [results, _] = await db.query(selectMyTravals)
    if (results.length > 0) {
      res.json({ msg: '查询成功', code: 2000, data: results })
    } else {
      res.json({ msg: '查询失败', code: 2001 })
    }
    db.release()
  } catch (error) {
    console.error(error)
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
router.post('/deltravel', async (req, res) => {
  const { travel_id } = req.body
  const deleteTraval = `DELETE FROM travel WHERE travel_id="${travel_id}"`
  try {
    const db = await pool.getConnection()
    const [results, _] = await db.query(deleteTraval)
    if (results.affectedRows > 0) {
      res.json({ msg: '删除成功', code: 2000 })
    } else {
      res.json({ msg: '删除失败', code: 2001 })
    }
    db.release()
  } catch (error) {
    console.error(error)
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
router.post('/register', async (req, res) => {
  const { username, password, code } = req.body
  try {
    const appid = 'wx4a6ea8fe7db1ee8e';
    const secret = 'd81028996caa82a8bbf415405ebb5b88';
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`
    const response = await axios.get(url);
    const data = response.data;
    if (data.openid) {
      const openid = data.openid;
      const db = await pool.getConnection()
      const checkUser = `SELECT * FROM user WHERE username="${username}"`
      const [results1, _1] = await db.query(checkUser)
      if (results1.length > 0) {
        res.json({ msg: '用户名重复', code: 2002 })
        db.release()
      }
      else {
        const registerSQL = `INSERT INTO user VALUE("${openid}", "${username}","${password}",'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png');`
        const [results2, _2] = await db.query(registerSQL)
        if (results2.affectedRows > 0) {
          res.json({ msg: '注册成功', code: 2000 })
        } else {
          res.json({ msg: '注册失败', code: 2001 })
        }
        db.release()
      }
    } else {
      // 处理错误情况  
      res.json({ msg: '获取用户openid失败', code: 2001 })
    }
  } catch (error) {
    // 处理请求过程中的异常  
    console.error(error);
  }
})


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
router.post('/login', async (req, res) => {
  const { username, password } = req.body
  const matchUser = `SELECT * FROM user WHERE username="${username}" AND password="${password}"`
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



/**
 * @swagger
 * /index:
 *   get:
 *     tags:
 *       - 获取用户数据
 *     summary: 获取用户端用户的总浏览量和游记数数据
 *     description: 获取用户端用户的总浏览量和游记数数据
 *     responses:
 *       200:
 *         description: 成功返回数据
 */
router.get('/mydata', async (req, res) => {
  const { id } = req.query
  const totalView = `SELECT SUM(views) FROM travel WHERE user_id="${id}" AND status <> '4'`
  const totalTravel = `SELECT COUNT(*) FROM travel WHERE user_id="${id}" AND status <> '4'`
  try {
    const db = await pool.getConnection()
    const [results1, _1] = await db.query(totalView)
    const [results2, _2] = await db.query(totalTravel)
    if (results1.length > 0 && results2.length > 0) {
      if (results1[0]['SUM(views)'] == null) {
        results1[0]['SUM(views)'] = 0
      }
      const re = { totalView: results1[0]['SUM(views)'], totalTravel: results2[0]['COUNT(*)'] }
      res.json({ msg: '查询成功', code: 2000, data: re });
    } else {
      res.json({ msg: '查询失败', code: 2001 });
    }
    db.release()
  } catch (error) {
    console.error(error);
  }
})

module.exports = router