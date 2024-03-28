const db = require('../db');
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
router.get('/index', (req, res) => {
  db.query('SELECT * FROM travals,user where travals.user_id=user.user_id', (err, results) => {
    let resu = results.sort(() => Math.random() - 0.5);
    let re = resu.slice(0, 10)
    res.json(re)
  })
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
router.get('/searchTitle', (req, res) => {
  const { searchKey } = req.query
  db.query(`SELECT * FROM travals WHERE title like '%${searchKey}%' or username like '%${searchKey}%'; `, (err, results) => {
    res.json(results)
  })
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
router.post('/addReadNum', (req, res) => {
  const { id, readnum } = req.body
  db.query(`UPDATE travals SET readnum = ${readnum} WHERE id = ${id} ; `, (err, results) => {
    res.json(results)
  })
})


module.exports = router