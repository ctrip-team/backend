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
// , user WHERE travels.user_id=user.user_id;
router.get('/index', async (req, res) => {
  const selectPassTravals = `SELECT * FROM travel,user,image WHERE travel.user_id=user.user_id AND travel.travel_id=image.travel_id AND status='${2}'`
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
  const selectWithTitle = `SELECT * FROM travel,user,image WHERE travel.user_id=user.user_id AND travel.travel_id=image.travel_id AND status='${2}' AND title LIKE '%${searchKey}%' OR username LIKE '%${searchKey}%' `
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
 *       - 增加阅读量
 *     summary: 增加阅读量
 *     description: 在数据库中将指定的条目的阅读数增加1
 *     responses:
 *       200:
 *         description: 成功返回
 */
router.post('/addReadNum', async (req, res) => {
  const { id, readnum } = req.body
  const addReadNum = `UPDATE travel SET views = ? WHERE travel_id = ? ; `
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