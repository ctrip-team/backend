const express = require("express");
const cors = require('cors')
const app = express();
const { PORT } = require('./config')
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


app.listen(PORT, () => {
    console.log(`Server running at http://192.168.0.102:${PORT}`);
    console.log(`For API docs, http://192.168.0.102:${PORT}/api-docs`);
});
