const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { OAuth2Client } = require('google-auth-library');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const port = 3001;
const googleClient = new OAuth2Client('778256795761-s8j6g5kq4mevkcul0kd72jpp1fvnmoes.apps.googleusercontent.com');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Define schemas and models
const userSchema = new mongoose.Schema({
    userId: { type: String, unique: true },
    name: String,
    email: { type: String, unique: true },
    password: String,
    mobileNumber: String,
    dob: Date
});

const User = mongoose.model('User', userSchema);

// API endpoints

// Register new user
app.post('/api/users/register', async (req, res) => {
    const { name, email, password, mobileNumber, dob } = req.body;
    const userId = uuidv4();

    try {
        const newUser = new User({
            userId,
            name,
            email,
            password,
            mobileNumber,
            dob
        });

        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// User login
app.post('/api/users/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email, password });
        if (user) {
            res.status(200).json({ userId: user.userId, name: user.name });
        } else {
            res.status(401).json({ error: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Google login
app.post('/api/users/google-login', async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: '778256795761-s8j6g5kq4mevkcul0kd72jpp1fvnmoes.apps.googleusercontent.com',
        });
        const payload = ticket.getPayload();
        const email = payload.email;

        let user = await User.findOne({ email });
        if (!user) {
            user = new User({
                userId: uuidv4(),
                name: payload.name,
                email,
                password: '', // Empty password for OAuth users
                mobileNumber: '',
                dob: null
            });
            await user.save();
        }

        res.status(200).json({ userId: user.userId, name: user.name });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Google login failed' });
    }
});

// Fetch user information
app.get('/api/users/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findOne({ userId });
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
