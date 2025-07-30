import React, { useEffect, useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function TodoList({ user, setUser }) {
  const [todos, setTodos] = useState([]);
  const [points, setPoints] = useState([""]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchTodos();
    // eslint-disable-next-line
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await API.get("/todo/my");
      setTodos(res.data);
    } catch (err) {
      setError("Failed to load todos");
    }
  };

  const handlePointChange = (i, value) => {
    const updated = [...points];
    updated[i] = value;
    setPoints(updated);
  };

  const addPoint = () => setPoints([...points, ""]);

  const handleCreate = async () => {
    try {
      await API.post("/todo", {
        points: points.filter((t) => t).map((t) => ({ text: t, completed: false })),
      });
      setPoints([""]);
      fetchTodos();
    } catch {
      setError("Create failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
  localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex flex-col items-center py-10">
      <div className="flex justify-between items-center w-full max-w-2xl mb-8">
        <h2 className="text-3xl font-bold text-purple-800">Welcome, {user?.username}</h2>
        <button onClick={handleLogout} className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition">Logout</button>
      </div>
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6 mb-8">
        <h4 className="text-xl font-semibold mb-4 text-purple-600">New Todo (point-wise)</h4>
        <div className="space-y-2 mb-4">
          {points.map((point, i) => (
            <input
              key={i}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              value={point}
              onChange={(e) => handlePointChange(i, e.target.value)}
              placeholder={`Task #${i + 1}`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={addPoint}
            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Add Point
          </button>
          <button
            onClick={handleCreate}
            className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
          >
            Create Todo
          </button>
        </div>
        {error && <p className="mt-2 text-red-500">{error}</p>}
      </div>
      <div className="w-full max-w-2xl">
        <h4 className="text-lg font-semibold mb-2 text-gray-800">Your Todos</h4>
        {todos.length === 0 && <p className="text-gray-400">No todos yet.</p>}
        {todos.map((todo) => (
          <ul key={todo._id} className="mb-4 bg-gray-50 rounded-lg p-4 shadow">
            {todo.points.map((pt, i) => (
              <li
                key={i}
                className={`pl-2 py-1 ${pt.completed ? "line-through text-gray-400" : "text-gray-700"}`}
              >
                {pt.text}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
