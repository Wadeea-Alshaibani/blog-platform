-- Create database
CREATE DATABASE IF NOT EXISTS blogdb;
USE blogdb;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content LONGTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Sample users
INSERT INTO users (name, email, password) VALUES 
('Wadeea Alshaibani', 'wadeea@example.com', '$2a$10$example1'),
('Ahmed Ali', 'ahmed@example.com', '$2a$10$example2');

-- Sample posts
INSERT INTO posts (user_id, title, content) VALUES 
(1, 'Introduction to DevOps', 'DevOps is a culture that emphasizes collaboration between development and operations teams...'),
(2, 'Docker Best Practices', 'When building Docker images, always follow these best practices for security and efficiency...'),
(1, 'Learning Kubernetes', 'Kubernetes is an orchestration platform that automates deployment, scaling, and management of containerized applications...');
