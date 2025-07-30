# Task Manager Application

A comprehensive todo list application with user management, task tracking, progress monitoring, and drag-and-drop functionality.

## Features

### 🎯 Core Features
- **User Authentication**: Login with email/password (admin-controlled user creation)
- **Task Management**: Create tasks with multiple sub-tasks (bullet points)
- **Progress Tracking**: Visual progress bars showing completion percentage
- **Task Assignment**: Admins can assign tasks to specific users
- **Priority Levels**: Set task priority (Low, Medium, High)
- **Status Management**: Track task status (Today, This Week, This Month, Later, Done, Canceled)

### 👨‍💼 Admin Features
- **Admin Dashboard**: Comprehensive overview of all tasks and users
- **User Management**: Create, view, and delete users
- **Task Assignment**: Assign tasks to users from admin panel
- **Progress Monitoring**: Track individual user performance
- **Statistics**: View task completion statistics
- **Task Editing**: Edit any task created by any user

### 🎨 User Interface
- **Modern UI**: Beautiful gradient design with Tailwind CSS
- **Responsive Design**: Works on desktop and mobile devices
- **Drag & Drop**: Kanban board with drag-and-drop functionality
- **Progress Bars**: Visual progress indicators for tasks
- **Color Coding**: Priority and status indicators with color coding

### 📊 Task Views
- **List View**: Traditional list view with all task details
- **Kanban Board**: Drag-and-drop board with columns for different statuses
- **Admin Panel**: Comprehensive dashboard for administrators

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory:
   ```
   MONGODB_URI=mongodb://localhost:27017/task-manager
   JWT_SECRET=your-secret-key-here
   PORT=5000
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Usage Guide

### Getting Started
1. Contact your administrator to create an account
2. Use the provided email and password to login
3. Default admin account: admin@example.com / admin123

### Creating Tasks
1. Log in to your account
2. In the "Create New Task" section:
   - Enter a task title
   - Select priority level (Low, Medium, High)
   - Optionally assign to a specific user
   - Add sub-tasks (bullet points) by clicking "Add Point"
   - Click "Create Task"

### Managing Tasks
- **Check off sub-tasks**: Click the checkbox next to each sub-task
- **View progress**: See the progress bar update as you complete sub-tasks
- **Switch views**: Use the toggle buttons to switch between List View and Kanban Board

### Using the Kanban Board
1. Click "Kanban Board" to switch to the drag-and-drop view
2. Drag tasks between columns to change their status:
   - **To Do**: New tasks
   - **In Progress**: Tasks being worked on
   - **Completed**: Finished tasks

### Admin Features
1. Log in with an admin account
2. Click "Admin Panel" to access the dashboard
3. Create new users using the "Create User" button
4. View all tasks and user statistics
5. Assign tasks to users using the dropdown menus
6. Monitor user progress and completion rates
7. Edit any task created by any user

## API Endpoints

### Authentication
- `POST /auth/login` - Login user
- `POST /auth/create-user` - Create a new user (admin only)
- `GET /auth/users` - Get all users (admin only)
- `DELETE /auth/users/:userId` - Delete a user (admin only)

### Tasks
- `GET /tasks` - Get all tasks
- `POST /tasks` - Create a new task
- `GET /tasks/status/:status` - Get tasks by status
- `PUT /tasks/:taskId/status` - Update task status
- `PUT /tasks/:taskId/assign` - Assign task to user
- `PUT /tasks/:taskId/points/:pointIdx/tick` - Mark sub-task as complete
- `PUT /tasks/:taskId/points/:pointIdx/untick` - Mark sub-task as incomplete
- `GET /tasks/admin/dashboard` - Get admin dashboard data

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **React Beautiful DnD** - Drag and drop functionality
- **Axios** - HTTP client
- **Tailwind CSS** - Styling framework
- **Vite** - Build tool

## Project Structure

```
task-manager/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   └── taskController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Task.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── task.js
│   ├── app.js
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── AdminPanel.jsx
    │   │   ├── KanbanBoard.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   └── Tasks.jsx
    │   ├── App.jsx
    │   ├── api.js
    │   └── main.jsx
    └── package.json
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License. 