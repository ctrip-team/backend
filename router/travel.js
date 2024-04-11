const pool = require('../db');
const express = require('express')
const router = express.Router()
const fs = require('fs').promises
const crypto = require('crypto');
const path = require('path')
const multer = require('multer');
const sanitizeHtml = require('sanitize-html');
const uploadImage = multer({ dest: path.join(__dirname, '../uploads/imgs') })
const uploadVideo = multer({ dest: path.join(__dirname, '../uploads/videos') })
const uploadPoster = multer({ dest: path.join(__dirname, '../uploads/posters') })
const uuid = require('uuid');
require('dotenv').config()

/*****************************
 * 
 * 小程序游记API
 * 
 ****************************/

/**
 * @swagger
 * /api/travel/getVideos:
 *   post:
 *     tags:
 *       - 游记（小程序）
 *     summary: 返回有视频的游记
 *     description: 根据当前travel状态返回有视频的游记
 *     requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 travel_id:
 *                   type: string
 *                   description: 游记id
 *                   example: 123
 *     responses:
 *       200:
 *         description: 成功返回游记
 */
router.post('/getVideos', async (req, res) => {
    const { travel_id } = req.body;
    const checkStatusQuery = `SELECT * FROM travel WHERE travel_id = ?`;
    try {
        const db = await pool.getConnection();

        const [results] = await db.query(checkStatusQuery, [travel_id]);
        console.log(results);
        if (results.length > 0) {
            const status = results[0].status;
            if (status !== '2') {
                db.release();
                res.json({ travels: results });
                return;
            }
        }
        const getTravelQuery = `
            SELECT *, 
            CASE WHEN travel_id = ? THEN 0 ELSE 1 END AS order_flag 
            FROM travel 
            WHERE video_url IS NOT NULL 
            AND status != 4
            ORDER BY order_flag`;
        const [travels] = await db.query(getTravelQuery, [travel_id]);
        db.release();
        res.json({ travels });
    } catch (error) {
        console.error(error);
    }
})

/**
 * @swagger
 * /api/travel/uploadImages/{travel_id}:
 *   post:
 *     summary: 上传游记图片
 *     tags: 
 *       - 游记（小程序）
 *     parameters:
 *       - in: path
 *         name: travel_id
 *         required: true
 *         schema:
 *           type: string
 *         description: 相关旅行 ID
 *       - in: formData
 *         name: image
 *         type: file
 *         required: true
 *         description: 要上传的图片文件
 *       - in: formData
 *         name: order
 *         type: integer
 *         required: true
 *         description: 图片显示顺序
 *     responses:
 *       200:
 *         description: 上传成功
 */
router.post('/uploadImages/:travel_id', uploadImage.single('image'), async (req, res) => {
    const file = req.file;
    const travel_id = req.params.travel_id;
    const { order } = req.body
    const filePath = file.path;
    const ext = file.originalname.split('.')[1]
    try {
        const data = await fs.readFile(filePath);
        const md5Hash = crypto.createHash('md5').update(data).digest('hex');
        const newFilePath = `uploads/imgs/${md5Hash}.${ext}`;
        const imageUrl = `${process.env.BASE_URL}/imgs/${md5Hash}.${ext}`;
        await fs.writeFile(newFilePath, data);
        await fs.unlink(filePath);

        const insertImageQuery = `INSERT INTO image (travel_id, image_url, display_order) VALUES (?, ?, ?)`;
        const db = await pool.getConnection();
        await db.query(insertImageQuery, [travel_id, imageUrl, parseInt(order)]);
        db.release();

        res.json({ msg: '图片上传成功' });
    } catch (error) {
        console.error(error);
        res.status(500).send('存储图片失败');
    }
})

/**
 * @swagger
 * /api/travel/updateOrder:
 *   post:
 *     summary: 更新游记图片顺序
 *     tags: 
 *       - 游记（小程序）
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               travel_id:
 *                 type: string
 *                 description: 旅行 ID
 *               url:
 *                 type: string
 *                 description: 图片 URL
 *               order:
 *                 type: integer
 *                 description: 显示顺序
 *             required:
 *               - travel_id
 *               - url
 *               - order
 *     responses:
 *       200:
 *         description: 更新成功
 */
router.post('/updateOrder', async (req, res) => {
    const { travel_id, url, order } = req.body;
    try {
        const db = await pool.getConnection();
        const updateQuery = `INSERT INTO image (travel_id, image_url, display_order) VALUES (?, ?, ?)`;
        await db.query(updateQuery, [travel_id, url, parseInt(order)]);
        db.release();
        res.json({ msg: '更新成功' });
    } catch (error) {
        console.error(error);
    }
})

/**
 * @swagger
 * /api/travel/uploadVideo/{travel_id}:
 *   post:
 *     summary: 上传游记视频
 *     tags: 
 *       - 游记（小程序）
 *     parameters:
 *       - in: path
 *         name: travel_id
 *         required: true
 *         schema:
 *           type: string
 *         description: 相关旅行 ID
 *       - in: formData
 *         name: video
 *         type: file
 *         required: true
 *         description: 要上传的视频文件
 *     responses:
 *       200:
 *         description: 视频上传成功
 */
router.post('/uploadVideo/:travel_id', uploadVideo.single('video'), async (req, res) => {
    const file = req.file;
    const travel_id = req.params.travel_id;
    const filePath = file.path;
    const videoUrl = `${process.env.BASE_URL}/videos/${file.originalname}`;
    try {
        const data = await fs.readFile(filePath);
        const newFilePath = `uploads/videos/${file.originalname}`;
        await fs.writeFile(newFilePath, data);
        await fs.unlink(filePath);
        const insertVideoQuery = `UPDATE travel SET video_url = ? WHERE travel_id = ?`
        const db = await pool.getConnection();
        await db.query(insertVideoQuery, [videoUrl, travel_id]);
        db.release();
        res.json({ msg: '视频上传成功' });
    } catch (error) {
        console.error(error);
        res.status(500).send('存储视频失败');
    }
})

/**
 * @swagger
 * /api/travel/deleteImages:
 *   post:
 *     tags:
 *       - 游记（小程序）
 *     summary: 删除某个游记的所有图片
 *     description: 删除某个游记的所有图片
 *     requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 travel_id:
 *                   type: string
 *                   description: 游记id
 *                   example: 123
 *     responses:
 *       200:
 *         description: 成功删除
 */
router.post('/deleteImages', async (req, res) => {
    const { travel_id } = req.body;
    try {
        const db = await pool.getConnection();
        const deleteQuery = `DELETE FROM image WHERE travel_id = ?`;
        await db.query(deleteQuery, [travel_id]);
        db.release();
        res.json({ msg: '已删除与该 travel_id 相关的所有内容' });
    } catch (error) {
        console.error(error);
    }
})

/**
 * @swagger
 * /api/travel/uploadPoster/{travel_id}:
 *   post:
 *     summary: 上传游记视频封面
 *     tags: 
 *       - 游记（小程序）
 *     parameters:
 *       - in: path
 *         name: travel_id
 *         required: true
 *         schema:
 *           type: string
 *         description: 旅行ID
 *       - in: formData
 *         name: poster
 *         type: file
 *         required: true
 *         description: 要上传的海报文件
 *     responses:
 *       200:
 *         description: 封面上传成功
 */
router.post('/uploadPoster/:travel_id', uploadPoster.single('poster'), async (req, res) => {
    const file = req.file;
    const travel_id = req.params.travel_id;
    const filePath = file.path;
    const ext = file.originalname.split('.')[1]
    try {
        const data = await fs.readFile(filePath);
        const md5Hash = crypto.createHash('md5').update(data).digest('hex');
        const newFilePath = `uploads/posters/${md5Hash}.${ext}`;
        const posterUrl = `${process.env.BASE_URL}/posters/${md5Hash}.${ext}`;
        await fs.writeFile(newFilePath, data);
        await fs.unlink(filePath);
        const insertVideoQuery = `UPDATE travel SET poster = ? WHERE travel_id = ?`
        const db = await pool.getConnection();
        await db.query(insertVideoQuery, [posterUrl, travel_id]);
        db.release();
        res.json({ msg: 'poster上传成功' });
    } catch (error) {
        console.error(error);
        res.status(500).send('存储poster失败');
    }
})

/**
 * @swagger
 * /api/travel/uploadText:
 *   post:
 *     summary: 上传游记文本
 *     tags: 
 *       - 游记（小程序）
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 标题
 *               content:
 *                 type: string
 *                 description: 内容
 *               userId:
 *                 type: string
 *                 description: 用户ID
 *             required:
 *               - title
 *               - content
 *               - userId
 *     responses:
 *       200:
 *         description: 标题和内容上传成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: 标题和内容上传成功的消息
 *                 travel_id:
 *                   type: string
 *                   description: 生成的旅行ID
 */
router.post('/uploadText', async (req, res) => {
    const { title, content, userId } = req.body;
    const contentWithoutScript = sanitizeHtml(content, {
        allowedTags: ['b', 'i', 'em', 'strong'],
        disallowedTagsMode: 'discard',
        textFilter: (text) => {
            return text.replace(/\n/g, '<br>');
        },
    });
    const travel_id = uuid.v4();

    const insertTravelQuery = `INSERT INTO travel (travel_id, user_id, title, content, status, created_at) VALUES (?, ?, ?, ?, 0, CURRENT_TIMESTAMP)`;
    try {
        const db = await pool.getConnection()
        await db.query(insertTravelQuery, [travel_id, userId, title, contentWithoutScript])
        db.release()
        res.json({ msg: '标题和内容上传成功', travel_id });
    } catch (error) {
        console.error(error);
    }
})

/**
 * @swagger
 * /api/travel/updateText:
 *   post:
 *     summary: 更新游记文本
 *     tags: 
 *       - 游记（小程序）
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 标题
 *               content:
 *                 type: string
 *                 description: 内容
 *               travel_id:
 *                 type: string
 *                 description: 旅行ID
 *             required:
 *               - title
 *               - content
 *               - travel_id
 *     responses:
 *       200:
 *         description: 文本更新成功
 */
router.post('/updateText', async (req, res) => {
    const { title, content, travel_id } = req.body;
    try {
        const db = await pool.getConnection();
        const updateQuery = `UPDATE travel SET title = ?, content = ?, status='0' WHERE travel_id = ?`;
        await db.query(updateQuery, [title, content, travel_id]);
        db.release();
        res.json({ msg: '文本更新成功' });
    } catch (error) {
        console.error(error);
    }
})

/**
 * @swagger
 * /api/travel/updateVideo/{travel_id}:
 *   post:
 *     summary: 更新游记视频
 *     tags: 
 *       - 游记（小程序）
 *     parameters:
 *       - in: path
 *         name: travel_id
 *         required: true
 *         schema:
 *           type: string
 *         description: 旅行ID
 *       - in: formData
 *         name: video
 *         type: file
 *         required: true
 *         description: 要上传的视频文件
 *     responses:
 *       200:
 *         description: 视频上传成功
 */
router.post('/updateVideo/:travel_id', uploadVideo.single('video'), async (req, res) => {
    const file = req.file;
    const travel_id = req.params.travel_id;
    const filePath = file.path;
    const videoUrl = `${process.env.BASE_URL}/videos/${file.originalname}`;
    try {
        const data = await fs.readFile(filePath);
        const newFilePath = `uploads/videos/${file.originalname}`;
        await fs.writeFile(newFilePath, data);
        await fs.unlink(filePath);
        const insertVideoQuery = `UPDATE travel SET video_url = ? , status='0' WHERE travel_id = ?`
        const db = await pool.getConnection();
        await db.query(insertVideoQuery, [videoUrl, travel_id]);
        db.release();
        res.json({ msg: '视频上传成功' });
    } catch (error) {
        console.error(error);
        res.status(500).send('存储视频失败');
    }
})

/**
 * @swagger
 * /api/travel/updatePoster/{travel_id}:
 *   post:
 *     summary: 更新视频封面
 *     tags:
 *       - 游记（小程序）
 *     parameters:
 *       - in: path
 *         name: travel_id
 *         required: true
 *         schema:
 *           type: string
 *         description: 旅行ID
 *       - in: formData
 *         name: poster
 *         type: file
 *         required: true
 *         description: 要上传的海报文件
 *     responses:
 *       200:
 *         description: 上传成功
 */
router.post('/updatePoster/:travel_id', uploadPoster.single('poster'), async (req, res) => {
    const file = req.file;
    const travel_id = req.params.travel_id;
    const filePath = file.path;
    const ext = file.originalname.split('.')[1]
    try {
        const data = await fs.readFile(filePath);
        const md5Hash = crypto.createHash('md5').update(data).digest('hex');
        const newFilePath = `uploads/posters/${md5Hash}.${ext}`;
        const posterUrl = `${process.env.BASE_URL}/posters/${md5Hash}.${ext}`;
        await fs.writeFile(newFilePath, data);
        await fs.unlink(filePath);
        const insertVideoQuery = `UPDATE travel SET poster = ? ,status='0' WHERE travel_id = ?`
        const db = await pool.getConnection();
        await db.query(insertVideoQuery, [posterUrl, travel_id]);
        db.release();
        res.json({ msg: 'poster上传成功' });
    } catch (error) {
        console.error(error);
        res.status(500).send('存储poster失败');
    }
})

/*****************************
 * 
 * 审核后台游记API
 * 
 ****************************/
/**
 * @swagger
 * /api/travel/get:
 *   get:
 *     tags:
 *       - 游记（审核后台）
 *     summary: 获取所有未删除的游记
 *     description: 获取所有未删除的游记
 *     responses:
 *       200:
 *         description: 成功返回游记
 */
router.get('/get', async (req, res) => {
    try {
        const getTravelQuery = `SELECT * FROM travel WHERE status <> 4 ORDER BY created_at DESC`;
        const db = await pool.getConnection()
        const [travelList, _] = await db.query(getTravelQuery);

        const promises = travelList.map(async (travel) => {
            const getImagesQuery = `SELECT image_url FROM image WHERE travel_id = ?`;
            const [imageResults] = await db.query(getImagesQuery, [travel.travel_id]);
            const images = imageResults.map(image => image.image_url);
            return { ...travel, imgs: images, key: travel.travel_id };
        });

        const results = await Promise.all(promises);
        db.release()
        res.json({ travelList: results });
    } catch (error) {
        console.error(error);
    }
});

/**
 * @swagger
 * /api/travel/getById:
 *   post:
 *     tags:
 *       - 游记（审核后台）
 *     summary: 通过游记id获取游记内容
 *     description: 通过游记id获取游记内容
 *     requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 travel_id:
 *                   type: string
 *                   description: 游记id
 *                   example: 123
 *     responses:
 *       200:
 *         description: 获取游记成功
 */
router.post('/getById', async (req, res) => {
    const { travel_id } = req.body;
    const sql = `SELECT * FROM travel,user WHERE travel.travel_id=? AND travel.user_id=user.user_id  `
    const sqlImage = `SELECT image_url FROM image WHERE travel_id=? ORDER BY display_order ASC`;
    try {
        const db = await pool.getConnection()
        const [results] = await db.query(sql, [travel_id])

        const [imageResults] = await db.query(sqlImage, [travel_id]);
        const imageUrls = imageResults.map(image => image.image_url);
        db.release()
        res.json({ msg: '获取游记成功', travel: { ...results[0], imgs: imageUrls } });
    } catch (error) {
        console.error(error);
    }
})

/**
 * @swagger
 * /api/travel/getDelete:
 *   get:
 *     tags:
 *       - 游记（审核后台）
 *     summary: 获取所有逻辑删除的游记
 *     description: 获取所有逻辑删除的游记
 *     responses:
 *       200:
 *         description: 成功返回游记
 */
router.get('/getDelete', async (req, res) => {
    const getDeleteTravelQuery = `SELECT * FROM travel WHERE status='4'`
    try {
        const db = await pool.getConnection()
        const [travelList] = await db.query(getDeleteTravelQuery)
        const promises = travelList.map(async (travel) => {
            const getImagesQuery = `SELECT image_url FROM image WHERE travel_id = ?`;
            const [imageResults] = await db.query(getImagesQuery, [travel.travel_id]);
            const images = imageResults.map(image => image.image_url);
            return { ...travel, imgs: images, key: travel.travel_id };
        });
        const results = await Promise.all(promises);
        db.release()
        res.json({ deleteTravelList: results });
    } catch (error) {
        console.error(error);
    }
})

/**
 * @swagger
 * /api/travel/pass:
 *   post:
 *     tags:
 *       - 游记（审核后台）
 *     summary: 通过游记
 *     description: 通过游记
 *     requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 travel_id:
 *                   type: string
 *                   description: 游记id
 *                   example: 123
 *                 role_id:
 *                   type: string
 *                   description: 角色id
 *                   example: 123
 *     responses:
 *       200:
 *         description: 已通过
 */
router.post('/pass', async (req, res) => {
    const { travel_id, role_id } = req.body;
    try {
        const db = await pool.getConnection()
        const updateRoleQuery = `UPDATE role SET review_count = review_count + 1 WHERE role_id = ?`;
        await db.query(updateRoleQuery, [role_id]);
        const updateQuery = `UPDATE travel SET status = '2' WHERE travel_id = ? `;
        await db.query(updateQuery, [travel_id])
        db.release()
        res.json({ msg: '已通过' });
    } catch (error) {
        console.error(error);
    }
})

/**
 * @swagger
 * /api/travel/reject:
 *   post:
 *     tags:
 *       - 游记（审核后台）
 *     summary: 拒绝通过某个游记
 *     description: 拒绝通过某个游记
 *     requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 travel_id:
 *                   type: string
 *                   description: 游记id
 *                   example: 123
 *                 role_id:
 *                   type: string
 *                   description: 角色id
 *                   example: 123
 *                 reason:
 *                   type: string
 *                   description: 拒绝理由
 *                   example: 违规内容
 *     responses:
 *       200:
 *         description: 已拒绝
 */
router.post('/reject', async (req, res) => {
    const { travel_id, reason, role_id } = req.body;

    try {
        const db = await pool.getConnection()
        const updateRoleQuery = `UPDATE role SET review_count = review_count + 1 WHERE role_id = ?`;
        await db.query(updateRoleQuery, [role_id]);
        const updateQuery = `UPDATE travel SET status = '1', reason = ? WHERE travel_id = ? `;
        await db.query(updateQuery, [reason, travel_id])
        db.release()
        res.json({ msg: '已拒绝', travel_id });
    } catch (error) {
        console.error(error);
    }
})

/**
 * @swagger
 * /api/travel/delete:
 *   post:
 *     tags:
 *       - 游记（审核后台）
 *     summary: 逻辑删除某个游记
 *     description: 逻辑删除某个游记
 *     requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 travel_id:
 *                   type: string
 *                   description: 游记id
 *                   example: 123
 *     responses:
 *       200:
 *         description: 已逻辑删除
 */
router.post('/delete', async (req, res) => {
    const { travel_id } = req.body;

    try {
        const db = await pool.getConnection()
        const updateQuery = `UPDATE travel SET status = '4' WHERE travel_id = ? `;
        await db.query(updateQuery, [travel_id])
        db.release()
        res.json({ msg: '已逻辑删除' });
    } catch (error) {
        console.error(error);
    }
})

/**
 * @swagger
 * /api/travel/recover:
 *   post:
 *     tags:
 *       - 游记（审核后台）
 *     summary: 恢复某个游记的数据
 *     description: 恢复某个游记的数据
 *     requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 travel_id:
 *                   type: string
 *                   description: 游记id
 *                   example: 123
 *     responses:
 *       200:
 *         description: 数据已恢复
 */
router.post('/recover', async (req, res) => {
    const { travel_id } = req.body;
    try {
        const db = await pool.getConnection()
        const updateQuery = `UPDATE travel SET status = '0' WHERE travel_id = ? `;
        await db.query(updateQuery, [travel_id])
        db.release()
        res.json({ msg: '数据已恢复' });
    } catch (error) {
        console.error(error);
    }
})

/**
 * @swagger
 * /api/travel/getTravelInfoAPI:
 *   post:
 *     tags:
 *       - 游记（审核后台）
 *     summary: 返回数据库中关于游记的信息
 *     description: 返回数据库中关于游记四个状态的数量，和当前用户的审核量
 *     requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 role_id:
 *                   type: string
 *                   description: 角色
 *                   example: 06053b94-ba33-4475-94f4-8fa381c16078
 *     responses:
 *       200:
 *         description: 成功返回游记
 */
router.post('/getTravelInfoAPI', async (req, res) => {
    const { role_id } = req.body;
    try {
        const db = await pool.getConnection();
        const getReviewCountQuery = `SELECT * FROM role WHERE role_id = ?`;
        const [roleResults] = await db.query(getReviewCountQuery, [role_id]);
        const review_count = roleResults[0].review_count

        const getStatusCountQuery = `
            SELECT 
                SUM(CASE WHEN status = '0' THEN 1 ELSE 0 END) AS status0,
                SUM(CASE WHEN status = '1' THEN 1 ELSE 0 END) AS status1,
                SUM(CASE WHEN status = '2' THEN 1 ELSE 0 END) AS status2,
                SUM(CASE WHEN status = '4' THEN 1 ELSE 0 END) AS status4
            FROM travel`;
        const [statusResults] = await db.query(getStatusCountQuery);
        db.release();
        res.json({ review_count, status_counts: statusResults[0] });
    } catch (error) {
        console.error(error);
    }
});

module.exports = router