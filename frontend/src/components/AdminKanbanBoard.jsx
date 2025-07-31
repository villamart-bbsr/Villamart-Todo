import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { 
  User, Clock, Target, CheckCircle, Circle, AlertCircle, MoreVertical, Plus, 
  RefreshCw, Edit, Trash2, FileText, Calendar, Users, FileUp, X, Save, 
  CalendarDays, CalendarRange, CalendarCheck, Clock3, CheckSquare, XCircle,
  Settings, FolderPlus
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";

export default function AdminKanbanBoard({ user = { username: "admin", isAdmin: true }, setUser = () => {} }) {
  const [tasks, setTasks] = useState({
    today: [],
    "this-week": [],
    "this-month": [],
    later: [],
    done: [],
    canceled: []
  });
  const [customSections, setCustomSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("today");
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    assignedTo: "",
    dueDate: "",
    points: [""]
  });
  const [newSection, setNewSection] = useState({
    name: "",
    color: "green",
    icon: "Target"
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
    fetchUsers();
    loadCustomSections();
  }, []);

  const loadCustomSections = () => {
    const savedSections = localStorage.getItem('customSections');
    if (savedSections) {
      setCustomSections(JSON.parse(savedSections));
    }
  };

  const saveCustomSections = (sections) => {
    localStorage.setItem('customSections', JSON.stringify(sections));
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");
      
      const categories = ["today", "this-week", "this-month", "later", "done", "canceled"];
      const promises = categories.map(category => 
        API.get(`/tasks/status/${category}`)
      );
      
      const responses = await Promise.all(promises);
      
      const newTasks = {};
      categories.forEach((category, index) => {
        let categoryTasks = responses[index].data || [];
        // If not admin, only keep tasks created by or assigned to current user
        if (!user.isAdmin) {
          categoryTasks = categoryTasks.filter(t =>
            (t.createdBy?._id === user._id) || (t.assignedTo?._id === user._id)
          );
        }
        newTasks[category] = categoryTasks;
      });
      
      // Add custom sections to tasks
      customSections.forEach(section => {
        newTasks[section.id] = [];
      });
      
      setTasks(newTasks);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to load tasks. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await API.get("/auth/users");
      setUsers(response.data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const createCustomSection = () => {
    if (!newSection.name.trim()) return;
    
    const section = {
      id: `custom-${Date.now()}`,
      name: newSection.name,
      color: newSection.color,
      icon: newSection.icon
    };
    
    const updatedSections = [...customSections, section];
    setCustomSections(updatedSections);
    saveCustomSections(updatedSections);
    
    // Add empty array for new section
    setTasks(prev => ({
      ...prev,
      [section.id]: []
    }));
    
    setNewSection({ name: "", color: "emerald", icon: "Target" });
    setShowSectionModal(false);
  };

  const deleteCustomSection = (sectionId) => {
    const updatedSections = customSections.filter(s => s.id !== sectionId);
    setCustomSections(updatedSections);
    saveCustomSections(updatedSections);
    
    // Remove section from tasks
    setTasks(prev => {
      const newTasks = { ...prev };
      delete newTasks[sectionId];
      return newTasks;
    });
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
  // Restrict non-admin users from moving tasks not owned by them
  if (!user.isAdmin) {
    const sourceTasks = tasks[result.source.droppableId];
    const draggedTask = sourceTasks[result.source.index];
    const isOwner = (draggedTask.createdBy?._id === user._id) || (draggedTask.assignedTo?._id === user._id);
    if (!isOwner) return; // not allowed
  }

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) {
      // Same column - reorder
      const column = tasks[source.droppableId];
      const newColumn = Array.from(column);
      const [removed] = newColumn.splice(source.index, 1);
      newColumn.splice(destination.index, 0, removed);
      
      setTasks({
        ...tasks,
        [source.droppableId]: newColumn
      });
    } else {
      // Different column - move and update status
      const sourceColumn = tasks[source.droppableId];
      const destColumn = tasks[destination.droppableId];
      const [movedTask] = sourceColumn.splice(source.index, 1);
      
      const newSourceColumn = Array.from(sourceColumn);
      const newDestColumn = Array.from(destColumn);
      newDestColumn.splice(destination.index, 0, movedTask);
      
      setTasks({
        ...tasks,
        [source.droppableId]: newSourceColumn,
        [destination.droppableId]: newDestColumn
      });

      // Update task status in backend
      try {
        await API.put(`/tasks/${draggableId}/status`, {
          status: destination.droppableId
        });
      } catch (err) {
        console.error("Error updating task status:", err);
        setError("Failed to update task status. Changes will be reverted.");
        setTimeout(() => {
          fetchTasks();
        }, 2000);
      }
    }
  };

  const createTask = async () => {
    try {
      const taskData = {
        ...newTask,
        status: selectedCategory,
        points: newTask.points.filter(point => point.trim() !== "")
      };
      // Regular users cannot assign tasks to others
      if (!user.isAdmin) {
        delete taskData.assignedTo;
      }
      await API.post("/tasks", taskData);
      setShowAddModal(false);
      setNewTask({
        title: "",
        description: "",
        priority: "medium",
        assignedTo: "",
        dueDate: "",
        points: [""]
      });
      fetchTasks();
    } catch (err) {
      console.error("Error creating task:", err);
      setError("Failed to create task.");
    }
  };

  // Check if user can edit a task
  const canEditTask = (task) => {
    // Admin can edit any task
    if (user.isAdmin) return true;
    // Regular users can only edit their own tasks
    return task.createdBy?._id === user._id;
  };

  // Check if user can assign tasks to others
  const canAssignToOthers = () => {
    return user.isAdmin;
  };

  const updateTask = async () => {
    try {
      const taskData = {
        ...selectedTask,
        points: selectedTask.points.filter(point => point.text.trim() !== "")
      };

      await API.put(`/tasks/${selectedTask._id}`, taskData);
      setShowTaskModal(false);
      setSelectedTask(null);
      fetchTasks();
    } catch (err) {
      console.error("Error updating task:", err);
      setError("Failed to update task.");
    }
  };

  // Check if user can delete a task
  const canDeleteTask = (task) => {
    // Only admins can delete tasks
    return user.isAdmin;
  };

  const deleteTask = async (taskId) => {
    try {
      await API.delete(`/tasks/${taskId}`);
      fetchTasks();
    } catch (err) {
      console.error("Error deleting task:", err);
      setError("Failed to delete task.");
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-600 border-red-200';
      case 'medium': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'low': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <AlertCircle className="w-3 h-3" />;
      case 'medium': return <Circle className="w-3 h-3" />;
      case 'low': return <CheckCircle className="w-3 h-3" />;
      default: return <Circle className="w-3 h-3" />;
    }
  };

  const getColumnConfig = (columnId) => {
    const configs = {
      today: {
        title: "Today",
        icon: <CalendarDays className="w-5 h-5" />,
        color: "text-emerald-700",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-200",
        accentColor: "bg-emerald-500"
      },
      "this-week": {
        title: "This Week",
        icon: <CalendarRange className="w-5 h-5" />,
        color: "text-green-700",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        accentColor: "bg-green-500"
      },
      "this-month": {
        title: "This Month",
        icon: <Calendar className="w-5 h-5" />,
        color: "text-teal-700",
        bgColor: "bg-teal-50",
        borderColor: "border-teal-200",
        accentColor: "bg-teal-500"
      },
      later: {
        title: "Later",
        icon: <Clock3 className="w-5 h-5" />,
        color: "text-emerald-700",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-200",
        accentColor: "bg-emerald-500"
      },
      done: {
        title: "Done",
        icon: <CheckSquare className="w-5 h-5" />,
        color: "text-emerald-700",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-200",
        accentColor: "bg-emerald-500"
      },
      canceled: {
        title: "Canceled",
        icon: <XCircle className="w-5 h-5" />,
        color: "text-red-700",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        accentColor: "bg-red-500"
      }
    };

    // Check if it's a custom section
    const customSection = customSections.find(s => s.id === columnId);
    if (customSection) {
      const colorMap = {
        emerald: {
          color: "text-emerald-700",
          bgColor: "bg-emerald-50",
          borderColor: "border-emerald-200",
          accentColor: "bg-emerald-500"
        },
        green: {
          color: "text-green-700",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          accentColor: "bg-green-500"
        },
        teal: {
          color: "text-teal-700",
          bgColor: "bg-teal-50",
          borderColor: "border-teal-200",
          accentColor: "bg-teal-500"
        },
        lime: {
          color: "text-lime-700",
          bgColor: "bg-lime-50",
          borderColor: "border-lime-200",
          accentColor: "bg-lime-500"
        },
        blue: {
          color: "text-blue-700",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          accentColor: "bg-blue-500"
        },
        purple: {
          color: "text-purple-700",
          bgColor: "bg-purple-50",
          borderColor: "border-purple-200",
          accentColor: "bg-purple-500"
        }
      };

      const iconMap = {
        Target: <Target className="w-5 h-5" />,
        Calendar: <Calendar className="w-5 h-5" />,
        Clock: <Clock className="w-5 h-5" />,
        CheckCircle: <CheckCircle className="w-5 h-5" />,
        AlertCircle: <AlertCircle className="w-5 h-5" />,
        FileText: <FileText className="w-5 h-5" />,
        Users: <Users className="w-5 h-5" />,
        Settings: <Settings className="w-5 h-5" />
      };

      return {
        title: customSection.name,
        icon: iconMap[customSection.icon] || <Target className="w-5 h-5" />,
        ...colorMap[customSection.color] || colorMap.blue
      };
    }

    return configs[columnId];
  };

  const calculateProgress = (columnTasks) => {
    if (columnTasks.length === 0) return 0;
    const totalProgress = columnTasks.reduce((sum, task) => sum + task.progress, 0);
    return Math.round(totalProgress / columnTasks.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <div className="text-lg text-emerald-600 font-medium">Loading your tasks...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-emerald-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link to="/tasks">
              <img src="./images/villamart-logo.png" alt="" className="w-40 h-19" />
              </Link>
              <div>
                
                {/* <h1 className="text-2xl font-bold text-slate-800">
                  {user.isAdmin ? 'Admin Task Board' : 'Task Board'}
                </h1>
                <p className="text-sm text-slate-500">
                  {user.isAdmin ? 'Manage your team\'s workflow' : 'View and manage your tasks'}
                </p> */}
              </div>
            </div>

            <h1 className="text-2xl font-bold text-emerald-800">
                  {user.isAdmin ? 'Admin Task Board' : 'Task Board'}
                </h1>
                <p className="text-sm text-emerald-600">
                  {user.isAdmin ? 'Manage your team\'s workflow' : 'View and manage your tasks'}
                </p>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={fetchTasks}
                disabled={loading}
                className="px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              
              <button 
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
              
              <button 
                onClick={() => setShowSectionModal(true)}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2 shadow-sm"
              >
                <FolderPlus className="w-4 h-4" />
                <span>Add Section</span>
              </button>
              
              {user.isAdmin && (
                <button 
                  onClick={() => navigate('/admin')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
              
              <div className="flex items-center space-x-2 px-3 py-2 bg-emerald-100 rounded-lg">
                <User className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-emerald-700">{user?.username}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-6 overflow-x-auto pb-4 min-h-[calc(100vh-200px)] scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-emerald-100">
            {Object.entries(tasks).map(([columnId, columnTasks]) => {
              const config = getColumnConfig(columnId);
              const progress = calculateProgress(columnTasks);
              
              return (
                <div key={columnId} className="flex flex-col min-w-[320px] max-w-[320px]">
                  {/* Column Header */}
                  <div className="bg-white rounded-t-xl shadow-sm border border-emerald-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg ${config.bgColor} flex items-center justify-center ${config.color}`}>
                          {config.icon}
                        </div>
                        <div>
                          <h2 className={`text-lg font-semibold ${config.color}`}>
                            {config.title}
                          </h2>
                          <span className="text-sm text-emerald-500">{columnTasks.length} tasks</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => {
                            setSelectedCategory(columnId);
                            setShowAddModal(true);
                          }}
                          className="p-1 hover:bg-emerald-100 rounded"
                        >
                          <Plus className="w-4 h-4 text-emerald-400" />
                        </button>
                        {customSections.find(s => s.id === columnId) && (
                          <button 
                            onClick={() => deleteCustomSection(columnId)}
                            className="p-1 hover:bg-red-100 rounded text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mb-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-emerald-600">Progress</span>
                        <span className="text-xs font-medium text-emerald-700">{progress}%</span>
                      </div>
                      <div className="w-full bg-emerald-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${config.accentColor}`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Column Content */}
                  <div className={`${config.bgColor} border-x border-b ${config.borderColor} rounded-b-xl shadow-sm flex-1`}>
                    <Droppable droppableId={columnId}>
                      {(provided, snapshot) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={`p-4 min-h-[500px] transition-colors ${
                            snapshot.isDraggingOver ? 'bg-emerald-50/50' : ''
                          }`}
                        >
                          {columnTasks.map((task, index) => (
                            <Draggable key={task._id} draggableId={task._id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`bg-white rounded-xl p-4 mb-4 border border-emerald-200 hover:shadow-md transition-all duration-200 cursor-pointer ${
                                    snapshot.isDragging ? 'shadow-lg rotate-2 scale-105' : ''
                                  }`}
                                  onClick={() => {
                                    setSelectedTask(task);
                                    setShowTaskModal(true);
                                  }}
                                >
                                  {/* Task Header */}
                                  <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-semibold text-emerald-800 text-sm leading-tight flex-1">
                                      {task.title}
                                    </h3>
                                    <div className="flex items-center space-x-1">
                                      <div className={`px-2 py-1 rounded-md text-xs font-medium border flex items-center space-x-1 ${getPriorityColor(task.priority)}`}>
                                        {getPriorityIcon(task.priority)}
                                        <span className="capitalize">{task.priority}</span>
                                      </div>
                                      {!canEditTask(task) && (
                                        <div className="px-2 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-600 border border-emerald-200">
                                          Read Only
                                        </div>
                                      )}
                                      {canDeleteTask(task) && (
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            deleteTask(task._id);
                                          }}
                                          className="p-1 hover:bg-red-50 rounded text-red-400 hover:text-red-600"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Task Details */}
                                  <div className="space-y-3">
                                    {/* Assignment */}
                                    <div className="flex items-center justify-between text-xs text-emerald-600">
                                      <div className="flex items-center space-x-1">
                                        <Users className="w-3 h-3" />
                                        <span>{task.assignedTo?.username || 'Unassigned'}</span>
                                      </div>
                                      <div className="flex items-center space-x-1 text-emerald-500">
                                        <User className="w-3 h-3" />
                                        <span>{task.createdBy?.username}</span>
                                      </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div>
                                      <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs text-emerald-600">Progress</span>
                                        <span className="text-xs font-medium text-emerald-700">{task.progress}%</span>
                                      </div>
                                      <div className="w-full bg-emerald-200 rounded-full h-2">
                                        <div 
                                          className={`h-2 rounded-full transition-all duration-500 ${config.accentColor}`}
                                          style={{ width: `${task.progress}%` }}
                                        ></div>
                                      </div>
                                    </div>

                                    {/* Points and Files */}
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-1 text-xs text-emerald-500">
                                        <CheckCircle className="w-3 h-3" />
                                        <span>{task.points?.length || 0} points</span>
                                      </div>
                                      
                                      {task.files && task.files.length > 0 && (
                                        <div className="flex items-center space-x-1 text-xs text-emerald-500">
                                          <FileText className="w-3 h-3" />
                                          <span>{task.files.length} files</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                          
                          {/* Empty State */}
                          {columnTasks.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-emerald-400">
                              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                                {config.icon}
                              </div>
                              <p className="text-sm">No tasks in {config.title.toLowerCase()}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </div>
                </div>
              );
            })}
          </div>
        </DragDropContext>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center">
            <div className="flex items-center justify-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-emerald-800">Add New Task</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-emerald-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter task title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-1">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows="3"
                  placeholder="Enter task description"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                {canAssignToOthers() && (
                  <div>
                    <label className="block text-sm font-medium text-emerald-700 mb-1">Assign To</label>
                    <select
                      value={newTask.assignedTo}
                      onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                      className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Select user</option>
                      {users.map(user => (
                        <option key={user._id} value={user._id}>{user.username}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-1">Points/Subtasks</label>
                {newTask.points.map((point, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={point}
                      onChange={(e) => {
                        const newPoints = [...newTask.points];
                        newPoints[index] = e.target.value;
                        setNewTask({...newTask, points: newPoints});
                      }}
                      className="flex-1 px-3 py-2 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Enter point/subtask"
                    />
                    <button
                      onClick={() => {
                        const newPoints = newTask.points.filter((_, i) => i !== index);
                        setNewTask({...newTask, points: newPoints});
                      }}
                      className="px-2 py-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setNewTask({...newTask, points: [...newTask.points, ""]})}
                  className="text-emerald-600 hover:text-emerald-700 text-sm flex items-center space-x-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Point</span>
                </button>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-emerald-300 text-emerald-700 rounded-lg hover:bg-emerald-50"
              >
                Cancel
              </button>
              <button
                onClick={createTask}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {showTaskModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-emerald-800">Task Details</h2>
              <button 
                onClick={() => setShowTaskModal(false)}
                className="p-1 hover:bg-emerald-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-1">Title</label>
                <input
                  type="text"
                  value={selectedTask.title}
                  onChange={(e) => setSelectedTask({...selectedTask, title: e.target.value})}
                  className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  disabled={!canEditTask(selectedTask)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-1">Description</label>
                <textarea
                  value={selectedTask.description || ""}
                  onChange={(e) => setSelectedTask({...selectedTask, description: e.target.value})}
                  className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows="3"
                  disabled={!canEditTask(selectedTask)}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-1">Priority</label>
                  <select
                    value={selectedTask.priority}
                    onChange={(e) => setSelectedTask({...selectedTask, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    disabled={!canEditTask(selectedTask)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-1">Assign To</label>
                  <select
                    value={selectedTask.assignedTo?._id || ""}
                    onChange={(e) => setSelectedTask({...selectedTask, assignedTo: e.target.value})}
                    className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    disabled={!canEditTask(selectedTask)}
                  >
                    <option value="">Select user</option>
                    {users.map(user => (
                      <option key={user._id} value={user._id}>{user.username}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={selectedTask.dueDate ? new Date(selectedTask.dueDate).toISOString().split('T')[0] : ""}
                    onChange={(e) => setSelectedTask({...selectedTask, dueDate: e.target.value})}
                    className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    disabled={!canEditTask(selectedTask)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-1">Points/Subtasks</label>
                {selectedTask.points.map((point, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={point.text || point}
                      onChange={(e) => {
                        const newPoints = [...selectedTask.points];
                        newPoints[index] = { ...newPoints[index], text: e.target.value };
                        setSelectedTask({...selectedTask, points: newPoints});
                      }}
                      className="flex-1 px-3 py-2 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      onClick={() => {
                        const newPoints = selectedTask.points.filter((_, i) => i !== index);
                        setSelectedTask({...selectedTask, points: newPoints});
                      }}
                      className="px-2 py-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setSelectedTask({...selectedTask, points: [...selectedTask.points, { text: "", completedBy: [] }]})}
                  className="text-emerald-600 hover:text-emerald-700 text-sm flex items-center space-x-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Point</span>
                </button>
              </div>
              
              {selectedTask.files && selectedTask.files.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-1">Files</label>
                  <div className="space-y-2">
                    {selectedTask.files.map((file, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-emerald-50 rounded">
                        <FileText className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm text-emerald-700">{file.originalName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowTaskModal(false)}
                className="flex-1 px-4 py-2 border border-emerald-300 text-emerald-700 rounded-lg hover:bg-emerald-50"
              >
                Close
              </button>
              {canEditTask(selectedTask) && (
                <button
                  onClick={updateTask}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Save Changes
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Section Modal */}
      {showSectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-emerald-800">Add New Section</h2>
              <button 
                onClick={() => setShowSectionModal(false)}
                className="p-1 hover:bg-emerald-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-1">Section Name</label>
                <input
                  type="text"
                  value={newSection.name}
                  onChange={(e) => setNewSection({...newSection, name: e.target.value})}
                  className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter section name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-1">Color</label>
                  <select
                    value={newSection.color}
                    onChange={(e) => setNewSection({...newSection, color: e.target.value})}
                    className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="emerald">Emerald</option>
                    <option value="green">Green</option>
                    <option value="teal">Teal</option>
                    <option value="lime">Lime</option>
                    <option value="blue">Blue</option>
                    <option value="purple">Purple</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-1">Icon</label>
                  <select
                    value={newSection.icon}
                    onChange={(e) => setNewSection({...newSection, icon: e.target.value})}
                    className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Target">Target</option>
                    <option value="Calendar">Calendar</option>
                    <option value="Clock">Clock</option>
                    <option value="CheckCircle">Check Circle</option>
                    <option value="AlertCircle">Alert Circle</option>
                    <option value="FileText">File Text</option>
                    <option value="Users">Users</option>
                    <option value="Settings">Settings</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowSectionModal(false)}
                className="flex-1 px-4 py-2 border border-emerald-300 text-emerald-700 rounded-lg hover:bg-emerald-50"
              >
                Cancel
              </button>
              <button
                onClick={createCustomSection}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Create Section
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 