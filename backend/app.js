const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] 📡 ${req.method} ${req.path}`);
    next();
});

// Database Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root123',
    database: process.env.DB_NAME || 'blogdb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Health Check
app.get('/health', (req, res) => {
    console.log(`[${new Date().toISOString()}] 📊 Health check`);
    res.json({ status: 'Backend running! ✅', uptime: process.uptime() });
});

// Metrics
app.get('/metrics', (req, res) => {
    console.log(`[${new Date().toISOString()}] 📊 Metrics`);
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
    });
});

// Register
app.post('/api/register', async (req, res) => {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
        return res.status(400).json({ error: 'All fields required' });
    }
    
    try {
        const connection = await pool.getConnection();
        const hashedPassword = await bcryptjs.hash(password, 10);
        
        await connection.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );
        connection.release();
        
        console.log(`[${new Date().toISOString()}] ✅ User registered: ${email}`);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ❌ Register error:`, error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }
    
    try {
        const connection = await pool.getConnection();
        const [users] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
        connection.release();
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const user = users[0];
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
        
        console.log(`[${new Date().toISOString()}] ✅ User logged in: ${email}`);
        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ❌ Login error:`, error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get all posts
app.get('/api/posts', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [posts] = await connection.query(
            'SELECT p.*, u.name as author FROM posts p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC'
        );
        connection.release();
        
        console.log(`[${new Date().toISOString()}] ✅ Fetched ${posts.length} posts`);
        res.json(posts);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ❌ Error:`, error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// Create post
app.post('/api/posts', async (req, res) => {
    const { title, content } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token || !title || !content) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const connection = await pool.getConnection();
        
        await connection.query(
            'INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)',
            [decoded.id, title, content]
        );
        connection.release();
        
        console.log(`[${new Date().toISOString()}] ✅ Post created by user ${decoded.id}`);
        res.status(201).json({ message: 'Post created successfully' });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ❌ Error:`, error);
        res.status(500).json({ error: 'Failed to create post' });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`[${new Date().toISOString()}] 🚀 Backend running on port ${PORT}`);
});
