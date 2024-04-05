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
var bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('uploads'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/user', userRouter)
app.use('/api/travel', travelRouter)
app.use('/api/index', indexRouter)
app.use('/api/role', roleRouter)
app.use('/api/my', myRouter)

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
