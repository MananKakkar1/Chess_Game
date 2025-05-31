const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB (adjust the URI if needed)
mongoose.connect('mongodb://localhost:27017/chessgame');

// User schema and model
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    email: { type: String, unique: true }, // Add email field
    password: String,
});
const User = mongoose.model('User', userSchema);

// Registration endpoint
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body; // Get email from request
    try {
        const hashed = await bcrypt.hash(password, 10);
        await User.create({ username, email, password: hashed }); // Store email
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ success: false, message: 'Username or email already exists' });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Start the server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));