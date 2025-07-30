import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { User, Clock, Target, CheckCircle, Circle, AlertCircle, MoreVertical, Plus, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function KanbanBoard({ user = { username: "demo_user", isAdmin: true }, setUser = () => {} }) {
  const [tasks, setTasks] = useState({
    todo: [],
    "in-progress": [],
    completed: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [todoRes, inProgressRes, completedRes] = await Promise.all([
        API.get("/tasks/status/todo"),
        API.get("/tasks/status/in-progress"),
        API.get("/tasks/status/completed")
      ]);

      setTasks({
        todo: todoRes.data || [],
        "in-progress": inProgressRes.data || [],
        completed: completedRes.data || []
      });
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to load tasks. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

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
        // Revert changes by refetching tasks
        setTimeout(() => {
          fetchTasks();
        }, 2000);
      }
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
      todo: {
        title: "To Do",
        color: "text-green-800",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        accentColor: "bg-green-600"
      },
      "in-progress": {
        title: "In Progress",
        color: "text-emerald-800",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-200",
        accentColor: "bg-emerald-600"
      },
      completed: {
        title: "Completed",
        color: "text-green-800",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        accentColor: "bg-green-700"
      }
    };
    return configs[columnId];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
          <div className="text-lg text-green-700 font-medium">Loading your tasks...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-green-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Target className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-green-800">VillaMart Task Board</h1>
                <p className="text-sm text-green-600">Manage your team's workflow efficiently</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={fetchTasks}
                disabled={loading}
                className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center space-x-2 disabled:opacity-50 border border-green-200"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg">
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
              
              {user?.isAdmin && (
                <>
                  <button 
                    onClick={() => navigate('/admin')}
                    className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors border border-emerald-200"
                  >
                    Admin Panel
                  </button>
                  <button 
                    onClick={() => navigate('/admin-kanban')}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-md"
                  >
                    Admin Kanban
                  </button>
                </>
              )}
              
              <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 rounded-lg border border-green-200">
                <User className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700 font-medium">{user?.username}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {Object.entries(tasks).map(([columnId, columnTasks]) => {
              const config = getColumnConfig(columnId);
              return (
                <div key={columnId} className="flex flex-col">
                  {/* Column Header */}
                  <div className="bg-white rounded-t-xl shadow-md border border-green-200 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${config.accentColor} shadow-sm`}></div>
                        <h2 className={`text-lg font-bold ${config.color}`}>
                          {config.title}
                        </h2>
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-semibold border border-green-200">
                          {columnTasks.length}
                        </span>
                      </div>
                      <button className="p-2 hover:bg-green-50 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4 text-green-500" />
                      </button>
                    </div>
                  </div>

                  {/* Column Content */}
                  <div className={`${config.bgColor} border-x border-b ${config.borderColor} rounded-b-xl shadow-md flex-1`}>
                    <Droppable droppableId={columnId}>
                      {(provided, snapshot) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={`p-4 min-h-[600px] transition-colors ${
                            snapshot.isDraggingOver ? 'bg-green-100/70' : ''
                          }`}
                        >
                          {columnTasks.map((task, index) => (
                            <Draggable key={task._id} draggableId={task._id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`bg-white rounded-xl p-4 mb-4 border border-green-200 hover:shadow-lg transition-all duration-200 hover:border-green-300 ${
                                    snapshot.isDragging ? 'shadow-xl rotate-2 scale-105 border-green-400' : ''
                                  }`}
                                >
                                  {/* Task Header */}
                                  <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-semibold text-green-800 text-sm leading-tight">
                                      {task.title}
                                    </h3>
                                    <div className={`px-2 py-1 rounded-lg text-xs font-medium border flex items-center space-x-1 ${getPriorityColor(task.priority)}`}>
                                      {getPriorityIcon(task.priority)}
                                      <span className="capitalize">{task.priority}</span>
                                    </div>
                                  </div>

                                  {/* Task Details */}
                                  <div className="space-y-3">
                                    {/* Assignment */}
                                    <div className="flex items-center justify-between text-xs text-green-600">
                                      <div className="flex items-center space-x-1">
                                        <User className="w-3 h-3" />
                                        <span className="font-medium">{task.assignedTo?.username || 'Unassigned'}</span>
                                      </div>
                                      <div className="flex items-center space-x-1 text-green-500">
                                        <Clock className="w-3 h-3" />
                                        <span>Created by {task.createdBy?.username}</span>
                                      </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div>
                                      <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs text-green-600 font-medium">Progress</span>
                                        <span className="text-xs font-bold text-green-700">{task.progress}%</span>
                                      </div>
                                      <div className="w-full bg-green-200 rounded-full h-2.5">
                                        <div 
                                          className={`h-2.5 rounded-full transition-all duration-500 ${config.accentColor}`}
                                          style={{ width: `${task.progress}%` }}
                                        ></div>
                                      </div>
                                    </div>

                                    {/* Points/Subtasks */}
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-1 text-xs text-green-600">
                                        <CheckCircle className="w-3 h-3" />
                                        <span className="font-medium">{task.points?.length || 0} points</span>
                                      </div>
                                      
                                      {task.points && task.points.length > 0 && (
                                        <div className="flex space-x-1">
                                          {task.points.slice(0, 2).map((point, idx) => (
                                            <span key={idx} className={`px-2 py-1 text-xs rounded-lg font-medium ${
                                              point.completedBy && point.completedBy.length > 0 
                                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                                                : 'bg-green-100 text-green-600 border border-green-200'
                                            }`}>
                                              {point.text?.substring(0, 10)}...
                                            </span>
                                          ))}
                                          {task.points.length > 2 && (
                                            <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-lg font-medium border border-green-200">
                                              +{task.points.length - 2}
                                            </span>
                                          )}
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
                            <div className="flex flex-col items-center justify-center py-12 text-green-400">
                              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 border-2 border-green-200">
                                <Target className="w-8 h-8 text-green-500" />
                              </div>
                              <p className="text-sm font-medium">No tasks in {config.title.toLowerCase()}</p>
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
          <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center shadow-md">
            <div className="flex items-center justify-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}