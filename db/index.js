const mysql = require('mysql');
const { DBHOST, DBNAME, DBUSER, DBPASSWORD } = require('../config/index')
const db = mysql.createConnection({
    host: DBHOST,
    user: DBUSER,
    password: DBPASSWORD,
    database: DBNAME
});

// const db = await mysql.createConnection({
//     host: DBHOST,
//     user: DBUSER,
//     password: DBPASSWORD,
//     database: DBNAME,
//     rowsAsArray: true,
// });

db.connect((err) => {
    if (err) {
        console.error('数据库连接失败:', err);
        return;
    }
    console.log('数据库连接成功');
});

module.exports = db;