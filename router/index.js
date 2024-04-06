const pool = require('../db');
const express = require('express')
const router = express.Router()


/**
 * @swagger
 * /index:
 *   get:
 *     tags:
 *       - 首页内容
 *     summary: 获取首页游记信息
 *     description: 从数据库返回一部分游记信息,随机选取10条数据
 *     responses:
 *       200:
 *         description: 成功返回一部分游记信息
 */
router.get('/index', async (req, res) => {
  const selectPassTravals = `SELECT * FROM travel t JOIN user u ON t.user_id = u.user_id JOIN (SELECT travel_id, MIN(image_id) AS min_image_id FROM image GROUP BY travel_id) AS sub ON t.travel_id = sub.travel_id JOIN image i ON sub.travel_id = i.travel_id AND sub.min_image_id = i.image_id WHERE t.status = '2' GROUP BY t.travel_id ORDER BY t.created_at DESC LIMIT 10;`
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
 * /index:
 *   get:
 *     tags:
 *       - 搜索结果
 *     summary: 获取搜索结果
 *     description: 从数据库返回一部分结果信息
 *     responses:
 *       200:
 *         description: 成功返回一部分游记信息
 */
router.get('/searchTitle', async (req, res) => {
  const { searchKey } = req.query
  const selectWithTitle = `SELECT * FROM travel t JOIN user u ON t.user_id = u.user_id JOIN (SELECT travel_id,MIN(image_id) AS min_image_id FROM image GROUP BY travel_id) min_image ON t.travel_id = min_image.travel_id JOIN image i ON min_image.min_image_id = i.image_id WHERE t.status = ${'2'} And (u.username LIKE '%${searchKey}%' OR t.title LIKE '%${searchKey}%'); `
  try {
    const db = await pool.getConnection()
    const [results, _] = await db.query(selectWithTitle)
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
 *       - 搜索用户
 *     summary: 获取搜索用户的结果
 *     description: 从数据库返回一部分结果信息
 *     responses:
 *       200:
 *         description: 成功返回一部分用户信息
 */
router.get('/searchUser', async (req, res) => {
  const { searchKey } = req.query
  const selectWithUser = `SELECT u.avatar, u.user_id, u.username, COALESCE(SUM(t.views), 0) AS total_views, COALESCE(COUNT(DISTINCT t.travel_id), 0) AS total_travels  FROM user u LEFT JOIN travel t ON u.user_id = t.user_id WHERE t.status = '2' AND u.username LIKE '%${searchKey}%' GROUP BY u.username;`
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
 * /index:
 *   get:
 *     tags:
 *       - 增加阅读量
 *     summary: 增加阅读量
 *     description: 在数据库中将指定的条目的阅读数增加1
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