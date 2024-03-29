# backend
项目初始化
├─config——配置文件
├─db——连接数据库
├─router——后端的路由
└─index.js——文件入口

# 当前数据库
## image表：image_id,travel_id,image_url
## reviewer表：reviewer_id,username,password,role
## travel表：travel_id,user_id,title_content,status,created_at
status: {'0':'待审核','1':'未通过','2':'审核通过',4:'逻辑删除'}
## user表：user_id,username,password

mysql下放了test数据库，可进行测试