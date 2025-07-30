# Task Manager Setup Instructions

## Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Set up Environment Variables**
   Create a `.env` file in the backend directory with:
   ```
   MONGO_URI=mongodb://localhost:27017/task-manager
   JWT_SECRET=your-secret-key-here
   PORT=5000
   ```

3. **Start MongoDB**
   Make sure MongoDB is running on your system. If you don't have it installed:
   - Download from: https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (cloud service)

4. **Seed Sample Data**
   ```bash
   npm run seed
   ```

5. **Start Backend Server**
   ```bash
   npm run dev
   ```
   The backend will run on http://localhost:5000

## Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Frontend Development Server**
   ```bash
   npm run dev
   ```
   The frontend will run on http://localhost:5173

## Features Implemented

### Backend API Endpoints
- `GET /api/tasks/status/:status` - Get tasks by status (today, this-week, this-month, later, done, canceled)
- `PUT /api/tasks/:taskId/status` - Update task status (for drag & drop)
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:taskId` - Update task details
- `GET /api/tasks` - Get all tasks
- `PUT /api/tasks/:taskId/assign` - Assign task to user
- `PUT /api/tasks/:taskId/points/:pointIdx/tick` - Mark point as completed
- `PUT /api/tasks/:taskId/points/:pointIdx/untick` - Unmark point
- `POST /api/tasks/:taskId/files` - Add file to task
- `DELETE /api/tasks/:taskId` - Delete task
- `GET /api/auth/users` - Get all users (admin only)
- `POST /api/auth/create-user` - Create new user (admin only)
- `DELETE /api/auth/users/:userId` - Delete user (admin only)

### Frontend Features

#### Regular Kanban Board (`/kanban`)
- ✅ Real-time Kanban board with drag & drop
- ✅ Task status updates via API
- ✅ Progress tracking based on completed points
- ✅ Priority indicators (high, medium, low)
- ✅ User assignment display
- ✅ Point/subtask display
- ✅ Refresh functionality
- ✅ Error handling and loading states

#### Admin Kanban Board (`/admin-kanban`)
- ✅ **6 Categories**: Today, This Week, This Month, Later, Done, Canceled
- ✅ **Progress Bars**: Each category shows overall progress
- ✅ **Add Task Buttons**: Quick add buttons for each category
- ✅ **Task Management**: Click tasks to edit details
- ✅ **Member Assignment**: Assign tasks to team members
- ✅ **Bullet Points**: Add/edit subtasks and points
- ✅ **File Upload**: Add files to tasks (backend ready)
- ✅ **Rich Text**: Add descriptions and notes
- ✅ **Due Dates**: Set and manage task deadlines
- ✅ **Priority Management**: Set task priorities
- ✅ **Drag & Drop**: Move tasks between categories
- ✅ **Delete Tasks**: Remove tasks with confirmation
- ✅ **Real-time Updates**: All changes sync with backend

### Sample Data
The seed script creates:
- 3 sample users (john_doe, jane_smith, mike_wilson)
- 7 sample tasks across all 6 categories
- Tasks with descriptions, due dates, points/subtasks and progress tracking

## Usage

### Regular Users
1. Login with your email and password
2. Navigate to http://localhost:5173/admin-kanban
3. View and manage your tasks in the kanban board
4. Create new tasks for yourself
5. Drag tasks between columns to update status

### Admin Users
1. Login with admin credentials (admin@example.com / admin123)
2. Navigate to http://localhost:5173/admin-kanban
3. **Add Tasks**: Click the "+" button in any category header
4. **Edit Tasks**: Click on any task card to open detailed editor (can edit any task)
5. **Assign Members**: Select team members from dropdown in task editor
6. **Add Points**: Add bullet points/subtasks in the task editor
7. **Set Due Dates**: Choose deadlines for tasks
8. **Manage Priority**: Set high, medium, or low priority
9. **Drag & Drop**: Move tasks between categories
10. **Delete Tasks**: Use the trash icon on task cards
11. **User Management**: Go to Admin Panel to create/delete users

### Task Categories
- **Today**: Urgent tasks that need immediate attention
- **This Week**: Tasks due within the next 7 days
- **This Month**: Tasks due within the next 30 days
- **Later**: Long-term tasks and future planning
- **Done**: Completed tasks for reference
- **Canceled**: Cancelled or abandoned tasks

## Troubleshooting

- **Connection Error**: Make sure MongoDB is running and the MONGO_URI is correct
- **CORS Error**: The backend is configured with CORS for localhost:5173
- **Authentication**: The current setup uses demo user data. For full authentication, implement login/register flow
- **File Upload**: File upload functionality is ready in the backend, but you may need to configure file storage (local or cloud) 