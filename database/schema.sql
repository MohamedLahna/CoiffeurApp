CREATE DATABASE IF NOT EXISTS atelier_noir CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE atelier_noir;
-- Run `php artisan migrate --seed` for the authoritative schema. This file is a PhpMyAdmin-friendly bootstrap reference.
CREATE TABLE users (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,name VARCHAR(255) NOT NULL,email VARCHAR(255) UNIQUE NOT NULL,phone VARCHAR(40),password VARCHAR(255) NOT NULL,role ENUM('admin','barber','client') DEFAULT 'client',loyalty_points INT UNSIGNED DEFAULT 0,created_at TIMESTAMP NULL,updated_at TIMESTAMP NULL);
CREATE TABLE services (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,name VARCHAR(255) NOT NULL,description TEXT,duration_minutes SMALLINT UNSIGNED NOT NULL,price DECIMAL(8,2) NOT NULL,category VARCHAR(255),image_url VARCHAR(255),is_active BOOLEAN DEFAULT TRUE,created_at TIMESTAMP NULL,updated_at TIMESTAMP NULL);
CREATE TABLE barber_profiles (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,user_id BIGINT UNSIGNED UNIQUE NOT NULL,bio TEXT,photo_url VARCHAR(255),rating DECIMAL(3,2) DEFAULT 5,is_active BOOLEAN DEFAULT TRUE,FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
