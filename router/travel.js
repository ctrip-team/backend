const db = require('../db');
const express = require('express')
const router = express.Router()
const fs = require('fs');
const path = require('path')
const multer = require('multer');
const upload = multer({ dest: path.join(__dirname, '../uploads/imgs') })
const uuid = require('uuid');

/**
 * @swagger
 * /api/get/{num}:
 *   get:
 *     tags:
 *       - 游记相关
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
 *         description: 成功返回指定数量的游记
 */
router.get('/get/:num', (req, res) => {
    const num = parseInt(req.params.num);

    if (isNaN(num) || num < 1 || num > 10) {
        return res.status(400).json({ error: '无效的数量参数' });
    }

    const getTravelPostsQuery = `SELECT * FROM travel_posts ORDER BY created_at DESC LIMIT ${num}`;
    db.query(getTravelPostsQuery, (err, results) => {
        if (err) throw err;

        res.json(results);
    });
})


router.post('/uploadImages/:travel_id', upload.single('image'), (req, res) => {
    const file = req.file;
    const travel_id = req.params.travel_id;
    const filePath = file.path;
    const imageUrl = `http://localhost:3000/imgs/${file.originalname}`;

    fs.readFile(filePath, (err, data) => {
        const newFilePath = `uploads/imgs/${file.originalname}`;
        fs.writeFile(newFilePath, data, (err) => {
            if (err) {
                return res.status(500).send('存储图片失败');
            }

            // 删除临时文件
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('删除临时文件失败:', err);
                }
            });

            // url存入数据库
            const insertImageQuery = `INSERT INTO image (travel_id, image_url) VALUES ('${travel_id}', '${imageUrl}')`;
            db.query(insertImageQuery, (err, result) => {
                if (err) {
                    console.error('SQL error:', err);
                    return res.status(500).json({ error: '数据库操作错误' });
                }
                res.json({ msg: '图片上传成功' });
            });
            
        })
    })

})

router.post('/uploadText', (req, res) => {
    const { title, content } = req.body;
    const userId = 'hyperyz';
    const travel_id = uuid.v4();

    const insertTravelQuery = `
        INSERT INTO travel (travel_id, user_id, title, content, status, created_at) 
        VALUES ('${travel_id}', '${userId}', '${title}', '${content}', 0, CURRENT_TIMESTAMP)
    `;

    db.query(insertTravelQuery, (err, result) => {
        if (err) {
            console.error('SQL error:', err);
            return res.status(500).json({ error: '数据库操作错误' });
        }

        res.json({ msg: '标题和内容上传成功', travel_id });
    });
})

module.exports = router