-- 
-- Gebruik dit script om je lokale database, en je test-database te maken.
-- LET OP: je moet als root ingelogd zijn om dit script uit te kunnen voeren.
-- Dit script creëert de database, de user, en opent de nieuwe database.
-- Daarna kun je het share-a-meal.sql script importeren.
-- In de connection settings gebruik je dan de nieuwe database, de user en het password.
-- 
DROP DATABASE IF EXISTS `share-a-meal`;
CREATE DATABASE `share-a-meal`;
DROP DATABASE IF EXISTS `share-a-meal-testdb`;
CREATE DATABASE `share-a-meal-testdb`;
-- share-a-meal-user aanmaken
CREATE USER IF NOT EXISTS 'share-a-meal-user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'secret';
CREATE USER IF NOT EXISTS 'share-a-meal-user'@'%' IDENTIFIED WITH mysql_native_password BY 'secret';
-- geef rechten aan deze user
GRANT SELECT, INSERT, DELETE, UPDATE ON `share-a-meal`.* TO 'share-a-meal-user'@'%';
GRANT SELECT, INSERT, DELETE, UPDATE ON `share-a-meal`.* TO 'share-a-meal-user'@'localhost';
GRANT SELECT, INSERT, DELETE, UPDATE ON `share-a-meal-testdb`.* TO 'share-a-meal-user'@'localhost';
GRANT SELECT, INSERT, DELETE, UPDATE ON `share-a-meal-testdb`.* TO 'share-a-meal-user'@'localhost';

USE `share-a-meal`;
