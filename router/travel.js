const pool = require('../db');
const express = require('express')
const router = express.Router()
const fs = require('fs').promises
const path = require('path')
const multer = require('multer');
const uploadImage = multer({ dest: path.join(__dirname, '../uploads/imgs') })
const uploadVideo = multer({ dest: path.join(__dirname, '../uploads/videos') })
const uuid = require('uuid');

/**
 * @swagger
 * /api/travel/get:
 *   get:
 *     tags:
 *       - 游记相关（后台）
 *     summary: 获取指定数量的游记
 *     description: 从数据库返回指定数量的游记
 *     parameters:
 *         - in: path
 *           name: num
 *           required: true
 *           description: 指定数量
 *           schema:
 *             type: integer
 *             minimum: 1
 *             maximum: 10
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

router.get('/getDelete', async (req, res) => {
    const getDeleteTravelQuery = `SELECT * FROM travel WHERE status='${4}'`
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

router.post('/getVideos', async (req, res) => {
    const { travel_id } = req.body;
    try {
        const getTravelQuery = `
            SELECT *, 
            CASE WHEN travel_id = ? THEN 0 ELSE 1 END AS order_flag 
            FROM travel 
            WHERE video_url IS NOT NULL 
            ORDER BY order_flag`;
        const db = await pool.getConnection();
        const [travels] = await db.query(getTravelQuery, [travel_id]);
        db.release();
        res.json({ travels });
    } catch (error) {
        console.error(error);
    }
})

router.post('/uploadImages/:travel_id', uploadImage.single('image'), async (req, res) => {
    const file = req.file;
    const travel_id = req.params.travel_id;
    const filePath = file.path;
    const imageUrl = `http://localhost:3000/imgs/${file.originalname}`;

    try {
        const data = await fs.readFile(filePath);
        const newFilePath = `uploads/imgs/${file.originalname}`;
        await fs.writeFile(newFilePath, data);

        await fs.unlink(filePath);

        const insertImageQuery = `INSERT INTO image (travel_id, image_url) VALUES ('${travel_id}', '${imageUrl}')`;
        const db = await pool.getConnection();
        await db.query(insertImageQuery);
        db.release();

        res.json({ msg: '图片上传成功' });
    } catch (error) {
        console.error(error);
        res.status(500).send('存储图片失败');
    }
})

router.post('/uploadVideo/:travel_id', uploadVideo.single('video'), async (req, res) => {
    const file = req.file;
    const travel_id = req.params.travel_id;
    const filePath = file.path;
    const videoUrl = `http://localhost:3000/videos/${file.originalname}`;

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


router.post('/uploadText', async (req, res) => {
    const { title, content, userId } = req.body;

    const contentWithBr = content.replace(/\n/g, '<br>');
    const travel_id = uuid.v4();

    const insertTravelQuery = `INSERT INTO travel (travel_id, user_id, title, content, status, created_at) VALUES (?, ?, ?, ?, 0, CURRENT_TIMESTAMP)`;
    try {
        const db = await pool.getConnection()
        await db.query(insertTravelQuery, [travel_id, userId, title, contentWithBr])
        db.release()
        res.json({ msg: '标题和内容上传成功', travel_id });
    } catch (error) {
        console.error(error);
    }
})

router.post('/getById', async (req, res) => {
    const { travel_id } = req.body;

    const sql = `SELECT * FROM travel,user WHERE travel.travel_id=? AND travel.user_id=user.user_id  `
    const sqlImage = `SELECT image_url FROM image WHERE travel_id=?`
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

router.post('/pass', async (req, res) => {
    const { travel_id } = req.body;
    try {
        const db = await pool.getConnection()
        const updateQuery = `UPDATE travel SET status = '2' WHERE travel_id = ? `;
        await db.query(updateQuery, [travel_id])
        db.release()
        res.json({ msg: '已通过' });
    } catch (error) {
        console.error(error);
    }
})

router.post('/reject', async (req, res) => {
    const { travel_id, reason } = req.body;

    try {
        const db = await pool.getConnection()
        const updateQuery = `UPDATE travel SET status = '1', reason = ? WHERE travel_id = ? `;
        await db.query(updateQuery, [reason, travel_id])
        db.release()
        res.json({ msg: '已拒绝', travel_id });
    } catch (error) {
        console.error(error);
    }
})

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

module.exports = router