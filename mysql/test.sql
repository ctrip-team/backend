/*
 Navicat MySQL Data Transfer

 Source Server         : hyperyz
 Source Server Type    : MySQL
 Source Server Version : 80300 (8.3.0)
 Source Host           : localhost:3306
 Source Schema         : test

 Target Server Type    : MySQL
 Target Server Version : 80300 (8.3.0)
 File Encoding         : 65001

 Date: 27/03/2024 22:34:19
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for image
-- ----------------------------
DROP TABLE IF EXISTS `image`;
CREATE TABLE `image`  (
  `image_id` int NOT NULL AUTO_INCREMENT,
  `travel_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `image_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`image_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of image
-- ----------------------------
INSERT INTO `image` VALUES (1, '58770413-7301-4b92-b5f2-aac7aee28a58', 'http://localhost:3000/imgs/xog7mtp5kSMTe2d3f2320770ba36b3be079c96aca19d.png');
INSERT INTO `image` VALUES (2, 'af768c58-e07f-4f34-b3dc-e5a1bb71429b', 'http://localhost:3000/imgs/xog7mtp5kSMTe2d3f2320770ba36b3be079c96aca19d.png');

-- ----------------------------
-- Table structure for reviewer
-- ----------------------------
DROP TABLE IF EXISTS `reviewer`;
CREATE TABLE `reviewer`  (
  `reviewer_id` int NOT NULL,
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `role` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`reviewer_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of reviewer
-- ----------------------------

-- ----------------------------
-- Table structure for travel
-- ----------------------------
DROP TABLE IF EXISTS `travel`;
CREATE TABLE `travel`  (
  `travel_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `user_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `created_at` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`travel_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of travel
-- ----------------------------
INSERT INTO `travel` VALUES ('296900de-0baa-4bb3-9461-0042a39171e9', 'hyperyz', 'test', 'test', '0', '2024-03-27 22:16:10');
INSERT INTO `travel` VALUES ('4bb369c6-93fc-459d-9b72-e1a5671690e0', 'hyperyz', '123', '123', '0', '2024-03-27 22:06:53');
INSERT INTO `travel` VALUES ('58770413-7301-4b92-b5f2-aac7aee28a58', 'hyperyz', 'test', 'test', '0', '2024-03-27 22:18:36');
INSERT INTO `travel` VALUES ('af768c58-e07f-4f34-b3dc-e5a1bb71429b', 'hyperyz', 'test', 'test', '0', '2024-03-27 22:19:54');
INSERT INTO `travel` VALUES ('d18e6bfa-121b-4b9e-8841-a68a6a609f20', 'hyperyz', 'test', 'test', '0', '2024-03-27 22:14:37');
INSERT INTO `travel` VALUES ('e2feb721-f2f8-42a0-a19b-125b5be3fdb2', 'hyperyz', '123', '123', '0', '2024-03-27 22:05:51');
INSERT INTO `travel` VALUES ('ef3f0ae1-0d02-4955-9a5d-4ec95bc96cd8', 'hyperyz', 'test', 'test', '0', '2024-03-27 22:16:40');

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `user_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`user_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES ('2c816ed4-ce23-42ca-a115-77d3a95021dd', 'yz', '123');
INSERT INTO `user` VALUES ('3c330f26-c45f-45c1-9cc0-d5f693c1a5ac', 'hyperyz', '123');
INSERT INTO `user` VALUES ('5ee04e49-5bce-4a00-ba93-70a296cc6524', 'yz1', '123');

SET FOREIGN_KEY_CHECKS = 1;
