const express = require("express");
const app = express();
const { PORT } = require('./config')
const userRouter = require('./router/user.js')
const indexRouter = require('./router/index.js')
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger.js');
const bodyParser = require('body-parser');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(bodyParser.json({ limit: '1mb' }));  //这里指定参数使用 json 格式

app.use('/api', userRouter)
app.use('/api', indexRouter)


app.listen(PORT, () => {
    console.log(`Server running at http://127.0.0.1:${PORT}`);
    console.log(`For API docs, http://127.0.0.1:${PORT}/api-docs`);
});
