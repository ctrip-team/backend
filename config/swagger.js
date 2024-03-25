const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: '旅游日记平台API',
            version: '1.0.0',
            description: '利用swagger配置接口文档',
        },
    },
    apis: ['./router/*.js'], // Path to the API routes
};
const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;