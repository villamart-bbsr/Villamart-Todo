import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Tasks from "./components/Tasks";
import AdminPanel from "./components/AdminPanel";
import Profile from "./components/Profile";
import AdminKanbanBoard from "./components/AdminKanbanBoard";

function App() {
  const initialUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();
  const [user, setUser] = useState(initialUser);

  // sync user changes to localStorage
  React.useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/tasks" element={user ? <Tasks user={user} setUser={setUser} /> : <Navigate to="/login" />} />
        <Route path="/admin" element={user?.isAdmin ? <AdminPanel user={user} setUser={setUser} /> : <Navigate to="/tasks" />} />
        <Route path="/profile" element={user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" />} />
        <Route path="/kanban" element={user ? <AdminKanbanBoard user={user} setUser={setUser} /> : <Navigate to="/login" />} />
        <Route path="/admin-kanban" element={user ? <AdminKanbanBoard user={user} setUser={setUser} /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/tasks" />} />
      </Routes>
    </Router>
  );
}

export default App;
