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


// Define Task schema and model
const taskSchema = new mongoose.Schema({
    name: String,
    dueDate: String,
    status: String,
    userId: String
});

const Task = mongoose.model('Task', taskSchema);

// Define Schedule schema and model
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
// Save Questions
app.post('/api/questions', async (req, res) => {
    const { subject, grade, questions } = req.body;
    try {
        const test = new Test({ subject, grade, questions, mcqs: [] });
        await test.save();
        res.status(201).json({ message: 'Questions saved successfully' });
    } catch (error) {
        console.error('Error saving questions:', error);
        res.status(500).json({ error: 'Failed to save questions' });
    }
});

// Save MCQs
app.post('/api/mcqs', async (req, res) => {
    const { subject, grade, mcqs } = req.body;
    try {
        const test = await Test.findOneAndUpdate(
            { subject, grade },
            { $set: { mcqs } },
            { new: true, upsert: true }
        );
        res.status(201).json({ message: 'MCQs saved successfully' });
    } catch (error) {
        console.error('Error saving MCQs:', error);
        res.status(500).json({ error: 'Failed to save MCQs' });
    }
});

// Fetch Tests
app.get('/api/tests', async (req, res) => {
    try {
        const tests = await Test.find({}, 'subject grade');
        res.status(200).json(tests);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tests' });
    }
});

// Fetch Test by Subject
app.get('/api/tests/:subject', async (req, res) => {
    const { subject } = req.params;
    try {
        const test = await Test.findOne({ subject });
        if (test) {
            res.status(200).json(test);
        } else {
            res.status(404).json({ error: 'Test not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch test' });
    }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
