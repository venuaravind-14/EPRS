const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/goals', require('./routes/goalRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));
app.use('/api/teams', require('./routes/teamRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/goal-reviews', require('./routes/goalReviewRoutes'));
app.use('/api/goalReviews', require('./routes/goalReviewRoutes'));
app.use('/api/task-reviews', require('./routes/taskReviewRoutes'));
app.use('/api/taskReviews', require('./routes/taskReviewRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/self-assessments', require('./routes/selfAssessmentRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/hr', require('./routes/hrRoutes'));


// Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
