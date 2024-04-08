const express = require("express");
const cors = require('cors')
require('dotenv').config()
const app = express();
const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const userRouter = require('./router/user.js')
const travelRouter = require('./router/travel.js')
const indexRouter = require('./router/index.js')
const myRouter = require('./router/my.js')
const roleRouter = require('./router/role.js')
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./config/swagger.js')
const rateLimit = require("express-rate-limit");
var bodyParser = require('body-parser')

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 分钟  
    max: 20, // 最大请求数  
    message: {
        statusCode: 429,
        error: 'Too Many Requests',
        message: '请求太频繁，请稍后再试。',
        details: {
            retryAfter: 60 // 建议多少秒后再试  
        }
    }
});

app.use(bodyParser.json())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('uploads'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(limiter);

app.use('/api/user', userRouter)
app.use('/api/travel', travelRouter)
app.use('/api/index', indexRouter)
app.use('/api/role', roleRouter)
app.use('/api/my', myRouter)

// 自定义错误处理中间件  
app.use((err, req, res, next) => {
    if (err.statusCode === 429) {
        // 如果是 429 Too Many Requests 错误，显示自定义提示信息  
        res.status(err.statusCode).json({
            error: err.message,
            details: {
                retryAfter: err.headers.retryAfter // 从错误对象中取出建议的重试时间  
            }
        });
    } else {
        // 对于其他错误，可以按需处理  
        next(err);
    }
});



// 创建服务
function createServer() {
    if (process.env.ENV === "production") {
        const options = {
            key: fs.readFileSync(
                path.join(__dirname, "/public/privkey.key")
            ),
            cert: fs.readFileSync(
                path.join(__dirname, "/public/fullchain.pem")
            ),
        };
        return https.createServer(options, app);
    } else {
        return http.createServer(app);
    }
}

const server = createServer();
server.listen(process.env.PORT, () => {
    console.log(`服务已启动在${process.env.PORT}端口`);
})

// app.listen(PORT, () => {
//     console.log(`Server running at http://192.168.0.102:${PORT}`);
//     console.log(`For API docs, http://192.168.0.102:${PORT}/api-docs`);
// });
