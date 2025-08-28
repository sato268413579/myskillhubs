USE myapp;

-- 依存関係のあるテーブルを先に削除する
DROP TABLE IF EXISTS `customer_tags`;
DROP TABLE IF EXISTS `notes`;
DROP TABLE IF EXISTS `contacts`;
DROP TABLE IF EXISTS `deals`;
DROP TABLE IF EXISTS `tags`;

-- 親テーブル
DROP TABLE IF EXISTS `customers`;
DROP TABLE IF EXISTS `users`;
