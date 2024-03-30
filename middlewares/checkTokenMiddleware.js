const jwt = require('jsonwebtoken')
const { secret } = require('../config')
module.exports = (req, res, next) => {
    let token = req.get('token')

    if (!token) {
        return res.json({
            code: '2003',
            msg: 'token缺失',
            data: null
        })
    }

    jwt.verify(token, secret, (err, data) => {
        if (err) {

            if (err.name === 'TokenExpiredError') {
                // Token 已过期
                return res.json({
                    code: '2005',
                    msg: 'token已过期',
                    data: null
                });
            }
            else {
                return res.json({
                    code: '2004',
                    msg: 'token校验失败',
                    data: null
                })
            }

        }
    })

    next()
}