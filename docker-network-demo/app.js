const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// "mongo" is the container name — Docker DNS resolves it on the network
const MONGO_URI = 'mongodb://mongo:27017/mydb';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Simple schema to store messages
const MessageSchema = new mongoose.Schema({
  text: String,
  createdAt: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', MessageSchema);

// Routes
app.get('/', (req, res) => {
  res.send(`
    <h2>Docker Network Demo 🐳</h2>
    <p>Node.js app is running and connected to MongoDB!</p>
    <p><a href="/messages">View messages</a></p>
    <form method="POST" action="/messages">
      <input name="text" placeholder="Type a message..." required />
      <button type="submit">Save to MongoDB</button>
    </form>
  `);
});

app.get('/messages', async (req, res) => {
  const messages = await Message.find().sort({ createdAt: -1 });
  const list = messages.map(m => `<li>${m.text} <small>(${m.createdAt.toISOString()})</small></li>`).join('');
  res.send(`<h2>Messages</h2><ul>${list || '<li>No messages yet</li>'}</ul><a href="/">← Back</a>`);
});

app.post('/messages', express.urlencoded({ extended: true }), async (req, res) => {
  await Message.create({ text: req.body.text });
  res.redirect('/messages');
});

app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ status: 'ok', database: dbStatus });
});

app.listen(3000, () => console.log('🚀 App running on http://localhost:3000'));
