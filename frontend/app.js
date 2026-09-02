const API_URL = 'http://localhost:3000/api';

// Load posts on page load
async function loadPosts() {
    try {
        const response = await fetch(`${API_URL}/posts`);
        const posts = await response.json();
        
        const postsList = document.getElementById('posts-list');
        postsList.innerHTML = '';
        
        posts.forEach(post => {
            const postCard = document.createElement('div');
            postCard.className = 'post-card';
            postCard.innerHTML = `
                <h3>${post.title}</h3>
                <p>${post.content.substring(0, 100)}...</p>
                <div class="author">By ${post.author} • ${new Date(post.created_at).toLocaleDateString()}</div>
            `;
            postsList.appendChild(postCard);
        });
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}

// Load posts on page load
loadPosts();

// Reload posts every 10 seconds
setInterval(loadPosts, 10000);

// Handle login form
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            location.reload();
        }
    } catch (error) {
        console.error('Login error:', error);
    }
});

// Handle create post form
document.getElementById('post-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, content })
        });
        
        if (response.ok) {
            document.getElementById('post-form').reset();
            loadPosts();
        }
    } catch (error) {
        console.error('Error creating post:', error);
    }
});

// Check if user is logged in
window.addEventListener('load', () => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (user && token) {
        document.getElementById('auth-link').style.display = 'none';
        document.getElementById('logout-link').style.display = 'block';
        document.getElementById('create-post-section').style.display = 'block';
        document.getElementById('login-section').style.display = 'none';
    }
});

// Handle logout
document.querySelector('#logout-link a')?.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    location.reload();
});
