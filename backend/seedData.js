const mongoose = require('mongoose');
const Task = require('./models/Task');
const User = require('./models/User');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true, useUnifiedTopology: true
    });
    console.log('MongoDB Connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();
    
    // Clear existing tasks
    await Task.deleteMany({});
    console.log('Cleared existing tasks');
    
    // Create sample users if they don't exist
    let admin = await User.findOne({ username: 'admin' });
    if (!admin) {
      admin = new User({ username: 'admin', email: 'admin@example.com', password: 'admin123', isAdmin: true });
      await admin.save();
      console.log('Admin user created: admin@example.com / admin123');
    }
    
    let user1 = await User.findOne({ username: 'john_doe' });
    if (!user1) {
      user1 = new User({ username: 'john_doe', email: 'john@example.com', password: 'password123' });
      await user1.save();
    }
    
    let user2 = await User.findOne({ username: 'jane_smith' });
    if (!user2) {
      user2 = new User({ username: 'jane_smith', email: 'jane@example.com', password: 'password123' });
      await user2.save();
    }
    
    let user3 = await User.findOne({ username: 'mike_wilson' });
    if (!user3) {
      user3 = new User({ username: 'mike_wilson', email: 'mike@example.com', password: 'password123' });
      await user3.save();
    }
    
    // Create sample tasks with new categories
    const sampleTasks = [
      {
        title: "Design new landing page",
        description: "Create a modern and responsive landing page for the new product launch",
        createdBy: user1._id,
        assignedTo: user2._id,
        status: "today",
        priority: "high",
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        points: [
          { text: "Create wireframes", completedBy: [] },
          { text: "Design mockups", completedBy: [] },
          { text: "Get client approval", completedBy: [] }
        ]
      },
      {
        title: "Set up CI/CD pipeline",
        description: "Configure automated deployment pipeline for the development team",
        createdBy: user3._id,
        assignedTo: user1._id,
        status: "this-week",
        priority: "medium",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
        points: [
          { text: "Configure GitHub Actions", completedBy: [] },
          { text: "Set up deployment scripts", completedBy: [] }
        ]
      },
      {
        title: "Implement user authentication",
        description: "Build secure authentication system with JWT tokens",
        createdBy: user2._id,
        assignedTo: user3._id,
        status: "this-month",
        priority: "high",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Next month
        points: [
          { text: "Create login form", completedBy: [user3._id] },
          { text: "Implement JWT tokens", completedBy: [user3._id] },
          { text: "Add password reset", completedBy: [] },
          { text: "Test authentication flow", completedBy: [] }
        ]
      },
      {
        title: "Database schema design",
        description: "Design and implement the database schema for the application",
        createdBy: user1._id,
        assignedTo: user2._id,
        status: "done",
        priority: "medium",
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        points: [
          { text: "Design user table", completedBy: [user2._id] },
          { text: "Design task table", completedBy: [user2._id] }
        ]
      },
      {
        title: "API documentation",
        description: "Write comprehensive API documentation for developers",
        createdBy: user3._id,
        assignedTo: user1._id,
        status: "done",
        priority: "low",
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        points: [
          { text: "Write API endpoints", completedBy: [user1._id] },
          { text: "Add examples", completedBy: [user1._id] }
        ]
      },
      {
        title: "Mobile app development",
        description: "Develop mobile application for iOS and Android platforms",
        createdBy: user1._id,
        assignedTo: user2._id,
        status: "later",
        priority: "medium",
        dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months
        points: [
          { text: "Design mobile UI", completedBy: [] },
          { text: "Implement core features", completedBy: [] },
          { text: "Testing and deployment", completedBy: [] }
        ]
      },
      {
        title: "Legacy system migration",
        description: "Migrate old system to new architecture",
        createdBy: user2._id,
        assignedTo: user3._id,
        status: "canceled",
        priority: "high",
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 2 weeks
        points: [
          { text: "Analyze legacy system", completedBy: [] },
          { text: "Plan migration strategy", completedBy: [] }
        ]
      }
    ];
    
    await Task.insertMany(sampleTasks);
    console.log('Sample tasks created successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData(); 