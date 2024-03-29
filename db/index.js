const mysql = require('mysql2/promise');
const { DBHOST, DBNAME, DBUSER, DBPASSWORD } = require('../config/index')

// 连接池
const pool = mysql.createPool({
    host: DBHOST,
    user: DBUSER,
    password: DBPASSWORD,
    database: DBNAME,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool

// const db = mysql.createConnection({
//     host: DBHOST,
//     user: DBUSER,
//     password: DBPASSWORD,
//     database: DBNAME
// });


// db.connect((err) => {
//     if (err) {
//         console.error('数据库连接失败:', err);
//         return;
//     }
//     console.log('数据库连接成功');
// });
