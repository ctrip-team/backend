const express = require("express");
const app = express();
const { PORT } = require('./config')
const userRouter = require('./router/user.js')
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger.js');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api', userRouter)


app.listen(PORT, () => {
    console.log(`Server running at http://127.0.0.1:${PORT}`);
    console.log(`For API docs, http://127.0.0.1:${PORT}/api-docs`);
});