const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { OAuth2Client } = require('google-auth-library');
const multer = require('multer');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const app = express();
app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Session setup
app.use(session({
  secret: '778256795761-s8j6g5kq4mevkcul0kd7', // Change this to a strong, unique secret key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

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
  role: String
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  const user = this;
  if (!user.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(user.password, salt);
  user.password = hash;
  next();
});

const User = mongoose.model('User', userSchema);
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
      role
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.post('/api/users/register', async (req, res) => {
  const { name, email, password, mobileNumber, grade, dob, role } = req.body;

  try {
    const newUser = new User({
      userId: uuidv4(),
      name,
      email,
      password, // Password will be hashed in pre-save hook
      mobileNumber,
      grade,
      dob,
      role
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
    const user = await User.findOne({ email });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        req.session.userId = user.userId; // Save userId to session
        req.session.role = user.role; // Save role to session
        res.status(200).json({ userId: user.userId, name: user.name, role: user.role });
      } else {
        res.status(401).json({ error: 'Invalid email or password' });
      }
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
  const { token, role } = req.body;

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
        role
      });
      await user.save();
    }

    req.session.userId = user.userId; // Save userId to session
    req.session.role = user.role; // Save role to session
    res.status(200).json({ userId: user.userId, name: user.name, role: user.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Google login failed' });
  }
});

// Fetch user information
app.get('/api/users/me', (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  User.findOne({ userId }, (err, user) => {
    if (err) return res.status(500).json({ error: 'Internal Server Error' });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json(user);
  });
});
// Define schemas and models


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

const taskSchema = new mongoose.Schema({
    name: String,
    dueDate: String,
    status: String,
    userId: String
});

const Task = mongoose.model('Task', taskSchema);

const scheduleSchema = new mongoose.Schema({
    time: String,
    class: String,
    userId: String
});

const Schedule = mongoose.model('Schedule', scheduleSchema);

const testSchema = new mongoose.Schema({
    subject: { type: String, unique: true },
    grade: { type: Number, required: true },
    questions: [
        {
            question: String,
            choices: [String]
        }
    ],
    mcqs: [
        {
            question: String,
            choices: [String],
            answer: String
        }
    ],
});

const Test = mongoose.model('Test', testSchema);

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API endpoints


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

// Task routes
app.get('/api/tasks', async (req, res) => {
    try {
        const { userId } = req.query;
        const tasks = await Task.find({ userId });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching tasks' });
    }
});

app.post('/api/tasks', async (req, res) => {
    try {
        const newTask = new Task(req.body);
        const savedTask = await newTask.save();
        res.json(savedTask);
    } catch (error) {
        res.status(500).json({ error: 'Error adding task' });
    }
});

// Schedule routes
app.get('/api/schedule', async (req, res) => {
    try {
        const { userId } = req.query;
        const schedule = await Schedule.find({ userId });
        res.json(schedule);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching schedule' });
    }
});

app.post('/api/schedule', async (req, res) => {
    try {
        const newSchedule = new Schedule(req.body);
        const savedSchedule = await newSchedule.save();
        res.json(savedSchedule);
    } catch (error) {
        res.status(500).json({ error: 'Error adding schedule' });
    }
});

// Tests routes
app.get('/api/tests', async (req, res) => {
    try {
        const tests = await Test.find();
        res.json(tests);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching tests' });
    }
});

app.post('/api/tests', async (req, res) => {
    try {
        const newTest = new Test(req.body);
        const savedTest = await newTest.save();
        res.json(savedTest);
    } catch (error) {
        res.status(500).json({ error: 'Error adding test' });
    }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
