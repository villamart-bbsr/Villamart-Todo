import React, { useEffect, useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function Tasks({ user, setUser }) {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newPoints, setNewPoints] = useState([""]);
  const [newAssignedTo, setNewAssignedTo] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("list"); // "list" or "kanban"
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
    if (user.isAdmin) {
      fetchUsers();
    }
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await API.get("/tasks");
      let fetched = res.data;
      if (!user.isAdmin) {
        fetched = fetched.filter(t =>
          (t.createdBy?._id === user._id) || (t.assignedTo?._id === user._id)
        );
      }
      setTasks(fetched);
    } catch {
      setError("Failed to load tasks");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get("/auth/users");
      setUsers(res.data);
    } catch {
      // Ignore error for non-admin users
    }
  };

  // Check if user can assign tasks to others
  const canAssignToOthers = () => {
    return user.isAdmin;
  };

  const handleAddPoint = () => setNewPoints([...newPoints, ""]);
  const handlePointChange = (i, value) => {
    const updated = [...newPoints];
    updated[i] = value;
    setNewPoints(updated);
  };

  const handleCreateTask = async () => {
    if (!newTitle.trim() || !newPoints.some(p => p.trim())) return;
    await API.post("/tasks", {
      title: newTitle,
      points: newPoints.filter((p) => p.trim()),
      assignedTo: newAssignedTo || undefined,
      priority: newPriority
    });
    setNewTitle("");
    setNewPoints([""]);
    setNewAssignedTo("");
    setNewPriority("medium");
    fetchTasks();
  };

  const tickPoint = async (taskId, idx, checked) => {
    await API.put(`/tasks/${taskId}/points/${idx}/${checked ? "untick" : "tick"}`);
    fetchTasks();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
  localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-700 border border-red-200';
      case 'medium': return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'low': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      default: return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'todo': return 'bg-gray-100 text-gray-700 border border-gray-300';
      default: return 'bg-gray-100 text-gray-700 border border-gray-300';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-emerald-500';
    if (progress >= 50) return 'bg-lime-500';
    return 'bg-orange-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-emerald-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
                    <img src="./images/villamart-logo.png" alt="" className="w-40 h-19"/>
                  </h1>
                  
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex bg-white rounded-xl p-1 shadow-sm border border-emerald-100">
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                    viewMode === "list" 
                      ? "bg-emerald-500 text-white shadow-sm" 
                      : "text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
                  }`}
                >
                  List View
                </button>
                <button
                  onClick={() => navigate("/kanban")}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                    viewMode === "kanban" 
                      ? "bg-emerald-500 text-white shadow-sm" 
                      : "text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
                  }`}
                >
                  Kanban Board
                </button>
              </div>
              
              {user?.isAdmin && (
                <button
                  onClick={() => navigate("/admin")}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm font-medium"
                >
                  Admin Panel
                </button>
              )}
              
              {/* Profile Icon */}
              <button
                onClick={() => navigate("/profile")}
                className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg hover:from-emerald-500 hover:to-green-600 transition-all duration-200 shadow-sm"
                title="Profile Settings"
              >
                {user?.username?.charAt(0).toUpperCase()}
              </button>
              
              <button 
                onClick={handleLogout} 
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-6 text-white">
            <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.username}!</h2>
            <p className="text-emerald-100">Manage your tasks efficiently with Villamart's task management system.</p>
          </div>
        </div>

        {/* Create Task Form */}
        {/* {user.isAdmin && (
          <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-8 mb-8">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-emerald-600 font-bold">+</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Create New Task</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
                <input
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  value={newTitle}
                  placeholder="Enter task title..."
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
                <select
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                >
                  <option value="low">🟢 Low Priority</option>
                  <option value="medium">🟡 Medium Priority</option>
                  <option value="high">🔴 High Priority</option>
                </select>
              </div>
            </div>
            
            {users.length > 0 && canAssignToOthers() && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Assign To</label>
                <select
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  value={newAssignedTo}
                  onChange={(e) => setNewAssignedTo(e.target.value)}
                >
                  <option value="">Select team member (optional)</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.username}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Sub-tasks</label>
              <div className="space-y-3">
                {newPoints.map((point, i) => (
                  <input
                    key={i}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                    value={point}
                    onChange={(e) => handlePointChange(i, e.target.value)}
                    placeholder={`Sub-task ${i + 1}...`}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleAddPoint}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
              >
                + Add Sub-task
              </button>
              <button
                onClick={handleCreateTask}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-200 shadow-sm font-medium"
              >
                Create Task
              </button>
            </div>
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </div>
        )} */}

        {/* Tasks Display */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800">Your Tasks</h3>
            <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border border-emerald-100">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} total
            </div>
          </div>
          
          <div className="grid gap-6">
            {tasks.map((task) => (
              <div key={task._id} className="bg-white rounded-2xl shadow-lg border border-emerald-50 hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="p-6">
                  {/* Task Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-xl font-semibold text-gray-800">{task.title}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority.toUpperCase()}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {task.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Created by <span className="font-medium text-emerald-600">{task.createdBy?.username}</span>
                      </p>
                    </div>
                  </div>
                  
                  {task.assignedTo && (
                    <div className="mb-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                      <p className="text-sm text-gray-700">
                        📋 Assigned to <span className="font-semibold text-emerald-700">{task.assignedTo.username}</span>
                      </p>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm font-semibold text-emerald-600">{task.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(task.progress)}`}
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Task Points */}
                  <div className="space-y-3">
                    {task.points.map((pt, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                        <input
                          type="checkbox"
                          checked={pt.completedBy?.some(u => u._id === user._id)}
                          onChange={() => tickPoint(task._id, i, pt.completedBy?.some(u => u._id === user._id))}
                          className="mt-1 w-5 h-5 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <div className="flex-1">
                          <span className={`block ${pt.completedBy?.some(u => u._id === user._id) ? "line-through text-gray-400" : "text-gray-700"}`}>
                            {pt.text}
                          </span>
                          {pt.completedBy?.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {pt.completedBy.map((user, idx) => (
                                <span key={idx} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                                  ✓ {user.username}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Task Footer */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Your Progress: <span className="font-semibold text-emerald-600">
                          {task.points.filter(pt => pt.completedBy?.some(u => u._id === user._id)).length}/{task.points.length}
                        </span> completed
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>•</span>
                        <span>Villamart Task System</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {tasks.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No tasks yet</h3>
              <p className="text-gray-500 mb-4">Create your first task to get started with Villamart's task management.</p>
              {user.isAdmin && (
                <button
                  onClick={() => document.querySelector('input[placeholder="Enter task title..."]')?.focus()}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-200 shadow-sm font-medium"
                >
                  Create First Task
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}