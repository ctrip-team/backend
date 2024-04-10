const pool = require('../db');
const express = require('express')
const router = express.Router()


/**
 * @swagger
 * /api/index/indexfirst:
 *   get:
 *     tags:
 *       - 小程序
 *     summary: 首次获取首页游记信息
 *     description: 从数据库全部的处于已发布状态的游记信息,随机选取6条数据进行返回
 *     responses:
 *       200:
 *         description: 成功返回一部分游记信息
 */
router.get('/indexfirst', async (req, res) => {
  const selectPassTravals = `SELECT u.username,u.avatar,t.travel_id,t.user_id,t.title,t.content,t.views,t.status,t.created_at,t.reason,t.video_url,COALESCE(t.video_url, i.image_url) AS image_url,COALESCE(t.poster, i.image_url) AS poster_url FROM travel t JOIN user u ON t.user_id = u.user_id LEFT JOIN image i ON t.travel_id = i.travel_id AND i.display_order = 0 WHERE t.status = 2 ORDER BY RAND() LIMIT 6;`
  try {
    const db = await pool.getConnection()
    const [results, _] = await db.query(selectPassTravals)
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
 * /api/index/index:
 *   get:
 *     tags:
 *       - 小程序
 *     summary: 获取首页游记信息
 *     description: 从数据库全部的处于已发布状态的游记信息,随机选取10条数据进行返回
 *     responses:
 *       200:
 *         description: 成功返回一部分游记信息
 */
router.get('/index', async (req, res) => {
  const selectPassTravals = `SELECT u.username,u.avatar,t.travel_id,t.user_id,t.title,t.content,t.views,t.status,t.created_at,t.reason,t.video_url,COALESCE(t.video_url, i.image_url) AS image_url,COALESCE(t.poster, i.image_url) AS poster_url FROM travel t JOIN user u ON t.user_id = u.user_id LEFT JOIN image i ON t.travel_id = i.travel_id AND i.display_order = 0 WHERE t.status = 2 ORDER BY RAND() LIMIT 10;`
  try {
    const db = await pool.getConnection()
    const [results, _] = await db.query(selectPassTravals)
    if (results.length > 0) {
      let resu = results.sort(() => Math.random() - 0.5);
      let re = resu.slice(0, 10)
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
 *  /api/index/searchTitle:
 *   get:
 *     tags:
 *       - 小程序
 *     summary: 获取搜索结果
 *     description: 从数据库中查找文章、视频名称或用户名称中包含查询字符串的游记信息，并按照分页查询的模式，每次返回十条信息
 *     parameters:
 *        required: true
 *        application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 searchKey:
 *                   type: string
 *                   description: 用户输入的搜索词
 *                   example: 携程上海
 *                 dataPage:
 *                   type: number
 *                   description: 搜索结果的页码
 *                   example: 1
 *     responses:
 *       200:
 *         description: 成功返回一部分游记信息
 */
router.get('/searchTitle', async (req, res) => {
  const { searchKey, dataPage } = req.query
  const selectWithTitle = `SELECT u.username,u.avatar,u.user_id,t.video_url,t.travel_id,t.user_id,t.title,t.content,t.views,t.status,t.created_at,t.reason,COALESCE(t.video_url, i.image_url) AS image_url,COALESCE(t.poster, i.image_url) AS poster_url FROM travel t JOIN user u ON t.user_id = u.user_id LEFT JOIN image i ON t.travel_id = i.travel_id AND i.display_order = 0 WHERE t.status = 2 AND (t.title LIKE '%${searchKey}%' OR u.username LIKE '%${searchKey}%') LIMIT 10 OFFSET ${dataPage}; `
  try {
    const db = await pool.getConnection()
    const [results, _] = await db.query(selectWithTitle)
    if (results.length > 0) {
      res.json({ msg: '查询成功', code: 2000, data: results });
    }
    else if (results.length == 0) {
      res.json({ msg: '已无后续数据', code: 2001 });
    }
    else {
      res.json({ msg: '查询失败', code: 2002 });
    }
    db.release()
  } catch (error) {
    console.error(error);
  }
})

/**
 * @swagger
 * /api/index/searchUser:
 *   get:
 *     tags:
 *       - 小程序
 *     summary: 获取搜索用户的结果
 *     description: 通过搜索词在数据库中查找用户的头像、用户名、游记数和浏览量等主要信息，并从数据库返回全部的结果信息
 *     parameters:
 *        required: true
 *        application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 searchKey:
 *                   type: string
 *                   description: 用户输入的搜索词
 *                   example: zave
 *     responses:
 *       200:
 *         description: 成功返回用户信息
 */
router.get('/searchUser', async (req, res) => {
  const { searchKey } = req.query
  const selectWithUser = `SELECT u.avatar, u.user_id, u.username, COALESCE(SUM(t.views), 0) AS total_views, COALESCE(COUNT(DISTINCT t.travel_id), 0) AS total_travels  FROM user u LEFT JOIN travel t ON u.user_id = t.user_id AND t.status = '2' WHERE u.username LIKE '%${searchKey}%' GROUP BY u.username ORDER BY total_views DESC;`
  try {
    const db = await pool.getConnection()
    const [results, _] = await db.query(selectWithUser)
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
 * /api/index/addReadNum:
 *   post:
 *     tags:
 *       - 小程序
 *     summary: 增加浏览量
 *     description: 当用户点击某一游记时，将会调用此函数，该游记的浏览量增加1
 *     requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: 游记的travel_id
 *                   example: 08db68ac-99d2-423f-b17c-e396e8cdb27f
 *                 readnum:
 *                   type: number
 *                   description: 游记的浏览量
 *                   example: 1001
 *     responses:
 *       200:
 *         description: 成功返回
 */
router.post('/addReadNum', async (req, res) => {
  const { id, readnum } = req.body
  const addReadNum = `UPDATE travel SET views = ? WHERE travel_id = ?; `
  try {
    const db = await pool.getConnection()
    const [results, _] = await db.query(addReadNum, [readnum, id])
    if (results.affectedRows > 0) {
      res.json({ msg: '增加成功', code: 2000 });
    } else {
      res.json({ msg: '增加失败', code: 2001 });
    }
    db.release()
  } catch (error) {
    console.error(error);
  }
})


module.exports = router