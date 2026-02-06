const express = require('express');
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const POSTS_DIR = path.join(__dirname, 'posts');

// Middleware
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));

// List posts
app.get('/', (req, res) => {
  fs.readdir(POSTS_DIR, (err, files) => {
    if (err) {
      return res.status(500).send('Error reading posts directory.');
    }
    const posts = files.filter(file => file.endsWith('.md'));
    res.send(`
      <link rel="stylesheet" href="/public/styles.css">
      <h1>Blog Posts</h1>
      <ul>
        ${posts.map(post => `<li><a href="/post/${post}">${post.replace('.md', '')}</a></li>`).join('')}
      </ul>
      <h2>Add a New Post</h2>
      <form action="/new" method="POST">
        <input type="text" name="title" placeholder="Post Title" required />
        <textarea name="content" placeholder="Post Content" required></textarea>
        <button type="submit">Add Post</button>
      </form>
    `);
  });
});

// Render a post
app.get('/post/:filename', (req, res) => {
  const filePath = path.join(POSTS_DIR, req.params.filename);
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(404).send('Post not found.');
    }
    res.send(`
      <link rel="stylesheet" href="/public/styles.css">
      <a href="/">Back to posts</a>
      <h1>${req.params.filename.replace('.md', '')}</h1>
      ${marked(data)}
    `);
  });
});

// Add a new post
app.post('/new', (req, res) => {
  const { title, content } = req.body;
  const fileName = `${title.replace(/\s+/g, '-').toLowerCase()}.md`;
  const filePath = path.join(POSTS_DIR, fileName);

  fs.writeFile(filePath, content, err => {
    if (err) {
      return res.status(500).send('Error saving the post.');
    }
    res.redirect('/');
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});