const express = require("express");
const app = express();
const { PORT } = require('./config')
const userRouter = require('./router/user.js')

app.use('/api', userRouter)


app.listen(PORT, () => {
    console.log(`Server running at http://127.0.0.1:${PORT}`);
});