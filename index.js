const express = require("express");
const app = express();
const { HOST } = require('./config/index')



app.listen(HOST, () => {
    console.log(`Server running at http://127.0.0.1:${HOST}`);
});