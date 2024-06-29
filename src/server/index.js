const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { OAuth2Client } = require('google-auth-library');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Set up storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

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
  grade: String,
  dob: Date,
  role: String // Adding role field
});

const User = mongoose.model('User', userSchema);

const videoSchema = new mongoose.Schema({
  videoId: { type: String, unique: true },
  filename: String, // Store the filename relative to 'uploads/'
  uploadDate: { type: Date, default: Date.now },
  userId: String,
  topic: String,
  grade: String,
  subject: String
});

const Video = mongoose.model('Video', videoSchema);

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API endpoints

// Register new user with role
app.post('/api/users/register', async (req, res) => {
  const { name, email, password, mobileNumber, grade, dob, role } = req.body;
  const userId = uuidv4();

  try {
    const newUser = new User({
      userId,
      name,
      email,
      password,
      mobileNumber,
      grade,
      dob,
      role // Save role in the database
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
      res.status(200).json({ userId: user.userId, name: user.name, role: user.role }); // Return role
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
  const { token, role } = req.body; // Added role from frontend

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
        dob: null,
        role // Assign role from Google login
      });
      await user.save();
    }

    res.status(200).json({ userId: user.userId, name: user.name, role: user.role }); // Return role
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

// Video upload endpoint
app.post('/api/videos/upload', upload.single('video'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { topic, grade, subject, userId } = req.body; // Extract metadata from request body
  const videoId = uuidv4();
  const newVideo = new Video({
    videoId,
    filename: req.file.filename,
    userId,
    topic,
    grade,
    subject
  });

  try {
    await newVideo.save();
    res.status(200).json({ message: 'File uploaded successfully', filename: req.file.filename });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Fetch all videos metadata
app.get('/api/videos', async (req, res) => {
  try {
    const videos = await Video.find();
    res.status(200).json(videos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Fetch a single video file by videoId
app.get('/api/videos/:videoId', async (req, res) => {
  const { videoId } = req.params;

  try {
    const video = await Video.findOne({ videoId });
    if (video) {
      const videoPath = path.join(__dirname, 'uploads', video.filename);
      res.sendFile(videoPath);
    } else {
      res.status(404).json({ error: 'Video not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
