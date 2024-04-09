const pool = require('../db');
const express = require('express')
const router = express.Router()
const axios = require('axios')

/**
 * @swagger
 * /api/my/mytravels:
 *   get:
 *     tags:
 *       - 小程序
 *     summary: 获取全部我的游记信息
 *     description: 从数据库返回我的全部游记信息
 *     parameters:
 *        required: true
 *        application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: string
 *                   description: 用户的user_id
 *                   example: 2c816ed4-ce23-42ca-a115-77d3a95021dd
 *     responses:
 *       200:
 *         description: 成功返回游记信息
 */
router.get('/mytravels', async (req, res) => {
  const { user_id } = req.query
  const selectMyTravals = `SELECT t.video_url,t.travel_id,t.user_id,t.title,t.content,t.views,t.status,COALESCE(t.video_url, i.image_url) AS image_url,COALESCE(t.poster, i.image_url) AS poster_url FROM travel t JOIN user u ON t.user_id = u.user_id LEFT JOIN image i ON t.travel_id = i.travel_id AND i.display_order = 0 WHERE t.status != 4 AND u.user_id = ? ORDER BY t.status ASC,t.created_at DESC;`
  try {
    const db = await pool.getConnection()
    const [results, _] = await db.query(selectMyTravals, [user_id])
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
 * /apu/my/deltravel:
 *   post:
 *     tags:
 *       - 小程序
 *     summary: 删除指定游记
 *     description: 从数据库删除指定的游记信息
 *     requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 travel_id:
 *                   type: string
 *                   description: 游记的travel_id
 *                   example: 08db68ac-99d2-423f-b17c-e396e8cdb27
 *     responses:
 *       200:
 *         description: 成功删除指定游记信息
 */
router.post('/deltravel', async (req, res) => {
  const { travel_id } = req.body
  const deleteTraval = `UPDATE travel SET status = '4' WHERE travel_id = ?`
  try {
    const db = await pool.getConnection()
    const [results, _] = await db.query(deleteTraval, [travel_id])
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
 * /api/my/register:
 *   post:
 *     tags:
 *       - 小程序
 *     summary: 用户端用户普通注册
 *     description: 将用户输入的用户名、密码信息连同从微信获取到的用户唯一微信openid、本小程序默认设置的头像一起，作为用户信息存入数据库中
 *     requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   description: 用户用户名
 *                   example: zave
 *                 password:
 *                   type: string
 *                   description: 用户密码
 *                   example: 123
 *                 code：
 *                   type: string
 *                   description: 用于进入微信服务器查询用户唯一openid时使用的临时验证码
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
      const checkUser = `SELECT * FROM user WHERE username = ?`
      const [results1, _1] = await db.query(checkUser, [username])
      if (results1.length > 0) {
        res.json({ msg: '用户名重复', code: 2002 })
        db.release()
      }
      else {
        const registerSQL = `INSERT INTO user VALUE(?, ?, ?, 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png');`
        const [results2, _2] = await db.query(registerSQL, [openid, username, password])
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
 * /api/my/registerByWeChat:
 *   post:
 *     tags:
 *       - 小程序
 *     summary: 用户端用户微信注册
 *     description: 通过获取用户微信信息，将获取到的用户微信唯一openid、头像。用户名连同本系统默认设置的密码123456x一起存入数据库中，当用户名出现重复时，将会为其生成随机用户名尾号
 *     requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   description: 用户微信名称
 *                   example: zave
 *                 password:
 *                   type: string
 *                   description: 系统默认设置的密码
 *                   example: 123456x
 *                avatar:
 *                   type: string
 *                   description: 用户微信头像url
 *                   example: https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png
 *                openId:
 *                   type: string
 *                   description: 用户微信openid
 *                   example: IoFZp0XzRqVi1U
 *     responses:
 *       200:
 *         description: 成功注册
 */
router.post('/registerByWeChat', async (req, res) => {
  let { username, password, avatar, openId } = req.body
  try {
    const db = await pool.getConnection()
    const checkUser = `SELECT * FROM user WHERE username = ?`
    let [results1, _1] = await db.query(checkUser, [username])
    //为保证用户名不重复，此处将对重复用户名做增加随机尾号处理
    if (results1.length > 0) {
      while (true) {
        const name = `${username}${Math.floor(Math.random() * 1000)}`
        username = name
        [results1, _1] = await db.query(checkUser)
        if (results1.length === 0) {
          break;
        }
      }
      db.release()
    }
    else {
      const registerSQL = `INSERT INTO user VALUE(?, ?, ?, ?)`
      const [results2, _2] = await db.query(registerSQL, [openId, username, password, avatar])
      if (results2.affectedRows > 0) {
        res.json({ msg: '通过微信注册成功', code: 2000 })
      } else {
        res.json({ msg: '通过微信注册失败', code: 2001 })
      }
      db.release()
    }
  } catch (error) {
    // 处理请求过程中的异常  
    console.error(error);
  }
})


/**
 * @swagger
 * /api/my/getOpenId:
 *   post:
 *     tags:
 *       - 小程序
 *     summary: 用户端用户微信openidID获取
 *     description: 通过此接口获取用户微信openid，便于后续操作
 *     requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   description: 用于进入微信服务器查询用户唯一openid时使用的临时验证码
 *     responses:
 *       200:
 *         description: 成功返回
 */
router.post('/getOpenId', async (req, res) => {
  let { code } = req.body
  try {
    const appid = 'wx4a6ea8fe7db1ee8e';
    const secret = 'd81028996caa82a8bbf415405ebb5b88';
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`
    const response = await axios.get(url);
    const data = response.data;
    if (data.openid) {
      res.json({ msg: '查询openid成功', code: 2000, data: data.openid })
    }
    else {
      res.json({ msg: '查询查询openid失败', code: 2001 })
    }
  } catch (error) {
    // 处理请求过程中的异常  
    console.error(error);
  }
})


/**
 * @swagger
 * /api/my/queryIsExit:
 *   post:
 *     tags:
 *       - 小程序
 *     summary: 判断微信登录账号是否存在
 *     description: 判断这个微信用户是否使用微信快捷注册登录注册与登录过本小程序
 *     requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 openId:
 *                   type: string
 *                   description: 用户微信openid
 *                   example: IoFZp0XzRqVi1U
 *     responses:
 *       200:
 *         description: 成功返回
 */
router.post('/queryIsExit', async (req, res) => {
  let { openId } = req.body
  try {
    const db = await pool.getConnection()
    const checkUser = `SELECT * FROM user WHERE user_id = ?`
    let [results1, _1] = await db.query(checkUser, [openId])
    if (results1.length > 0) {
      res.json({ msg: '查询微信openid是否存在成功', code: 2000, data: results1[0] })
    }
    else {
      res.json({ msg: '查询微信openid是否存在失败', code: 2001 })
    }
    db.release()
  } catch (error) {
    // 处理请求过程中的异常  
    console.error(error);
  }
})


/**
 * @swagger
 * /api/my/login:
 *   post:
 *     tags:
 *       - 小程序
 *     summary: 用户登录
 *     description: 将用户输入的用户名和密码信息到数据库中进行比对，并返回比对成功的用户信息
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
 *                   example: zave
 *                 password:
 *                   type: string
 *                   description: 密码
 *                   example: 123456x
 *     responses:
 *       200:
 *         description: 成功登录
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body
  const matchUser = `SELECT * FROM user WHERE username = ? AND password = ?`
  try {
    const db = await pool.getConnection()
    const [results, _] = await db.query(matchUser, [username, password])
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
 * /api/my/mydata:
 *   get:
 *     tags:
 *       - 小程序
 *     summary: 获取用户端用户的已发布状态的游记的总浏览量和已发布状态的游记数数据
 *     description: 获取用户端用户的已发布状态的游记的总浏览量和已发布状态的游记数数据
 *     parameters:
 *        required: true
 *        application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: 用户的user_id
 *                   example: 2c816ed4-ce23-42ca-a115-77d3a95021dd
 *     responses:
 *       200:
 *         description: 成功返回数据
 */
router.get('/mydata', async (req, res) => {
  const { id } = req.query
  const totalView = `SELECT COALESCE(SUM(views),0) AS totalView FROM travel WHERE user_id = ? AND status = 2`
  const totalTravel = `SELECT COALESCE(COUNT(*),0) AS totalTravel FROM travel WHERE user_id = ? AND status = 2`
  try {
    const db = await pool.getConnection()
    const [results1, _1] = await db.query(totalView, [id])
    const [results2, _2] = await db.query(totalTravel, [id])
    if (results1.length > 0 && results2.length > 0) {
      const re = { totalView: results1[0]['totalView'], totalTravel: results2[0]['totalTravel'] }
      res.json({ msg: '查询成功', code: 2000, data: re });
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
 * /api/my/infodata:
 *   get:
 *     tags:
 *       - 小程序
 *     summary: 获取个人主页的用户信息、游记等数据
 *     description: 获取个人主页的用户信息、游记等数据
 *     parameters:
 *        required: true
 *        application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: 用户的user_id
 *                   example: 2c816ed4-ce23-42ca-a115-77d3a95021dd
 *     responses:
 *       200:
 *         description: 成功返回数据
 */
router.get('/infodata', async (req, res) => {
  const { id } = req.query
  const getTravelList = `SELECT t.video_url,t.travel_id,t.user_id,t.title,t.content,t.views,t.status,COALESCE(t.video_url, i.image_url) AS image_url,COALESCE(t.poster, i.image_url) AS poster_url FROM travel t JOIN user u ON t.user_id = u.user_id LEFT JOIN image i ON t.travel_id = i.travel_id AND i.display_order = 0 WHERE t.status = 2 AND u.user_id = ? ORDER BY t.created_at ASC;`
  const getInfoDataOfTravels = `SELECT COALESCE(COUNT(*),0) AS totalTravel FROM travel WHERE user_id = ? AND status = 2`
  const getInfoDataOfViews = `SELECT COALESCE(SUM(views),0) AS totalView FROM travel WHERE user_id = ? AND status = 2`
  const getUserInfo = `SELECT * FROM user WHERE user_id = ?`
  try {
    const db = await pool.getConnection()
    const [results1, _1] = await db.query(getInfoDataOfViews, [id])
    const [results2, _2] = await db.query(getInfoDataOfTravels, [id])
    const [results3, _3] = await db.query(getTravelList, [id])
    const [results4, _4] = await db.query(getUserInfo, [id])
    if (results1.length > 0 && results2.length > 0) {
      const re = { totalView: results1[0]['totalView'], totalTravel: results2[0]['totalTravel'], travelList: results3, userInfo: results4[0] }
      res.json({ msg: '查询成功', code: 2000, data: re });
    }
    else {
      res.json({ msg: '查询失败', code: 2001 });
    }
    db.release()
  } catch (error) {
    console.error(error);
  }
})


module.exports = router