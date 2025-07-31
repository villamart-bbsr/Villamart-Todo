import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function Login({ setUser }) {
  const [data, setData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await API.post("/auth/login", data);
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/tasks");
    } catch (err) {
      setError(err.response?.data?.msg || "Error");
    }
  };

return (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-100">
    <div className="w-full max-w-xs p-8 bg-white rounded-2xl shadow-2xl border-t-4 border-green-400">
      <div className="flex justify-center mb-6">
        <img
          src="/images/villamart-logo.png" // <-- Replace with your actual logo path
          alt="Villamart Logo"
          className="h-16 w-16 object-contain rounded-full border-2 border-green-400 shadow"
        />
      </div>
      <h2 className="mb-6 text-2xl font-bold text-center text-green-700">Villamart Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          placeholder="Email"
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
        />
        <input
          type="password"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          placeholder="Password"
          value={data.password}
          onChange={(e) => setData({ ...data, password: e.target.value })}
        />
        <button
          type="submit"
          className="w-full py-2 text-white bg-green-500 rounded-lg hover:bg-green-600 transition font-semibold shadow"
        >
          Login
        </button>
        {error && <div className="text-sm text-red-500 text-center">{error}</div>}
      </form>
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">Contact your administrator for account access</p>
      </div>
    </div>
  </div>
);
// ...existing code...
}
