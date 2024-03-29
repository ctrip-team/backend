const pool = require('../db');
const express = require('express')
const router = express.Router()
const fs = require('fs').promises
const path = require('path')
const multer = require('multer');
const upload = multer({ dest: path.join(__dirname, '../uploads/imgs') })
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
        const getTravelQuery = `SELECT * FROM travel ORDER BY created_at DESC`;
        const db = await pool.getConnection()
        const [travelList, _] = await db.query(getTravelQuery);

        const promises = travelList.map(async (travel) => {
            const getImagesQuery = `SELECT image_url FROM image WHERE travel_id = ?`;
            const [imageResults] = await db.query(getImagesQuery, [travel.travel_id]);
            const images = imageResults.map(image => image.image_url);
            return { ...travel, imgs: images, key: travel.travel_id };
        });

        const results = await Promise.all(promises);
        console.log('results', results);
        res.json({ travelList: results });
    } catch (error) {
        console.error(error);
    }
});


router.post('/uploadImages/:travel_id', upload.single('image'), async (req, res) => {
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


router.post('/uploadText', async (req, res) => {
    const { title, content } = req.body;
    const userId = 'hyperyz';
    const travel_id = uuid.v4();

    const insertTravelQuery = `
        INSERT INTO travel (travel_id, user_id, title, content, status, created_at) 
        VALUES ('${travel_id}', '${userId}', '${title}', '${content}', 0, CURRENT_TIMESTAMP)
    `;
    try {
        const db = await pool.getConnection()
        await db.query(insertTravelQuery)
        db.release()
        res.json({ msg: '标题和内容上传成功', travel_id });
    } catch (error) {
        console.error(error);
    }
})

module.exports = router