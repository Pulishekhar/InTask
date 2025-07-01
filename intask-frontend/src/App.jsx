import React from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects/Projects";
import ProjectDetails from "./pages/Projects/ProjectDetails";
import Teams from "./pages/Teams";
import Login from './pages/Login';
import Profile from './pages/Profile';
import Register from './pages/Register';
import PrivateRoute from './routes/PrivateRoute';

const App = () => {
  return (
    <>
      <ToastContainer position="top-center" autoClose={2500} limit={1} />

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes inside Layout */}
        <Route path="/" element={<Layout />}>
          <Route
            path="dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="projects"
            element={
              <PrivateRoute>
                <Projects />
              </PrivateRoute>
            }
          />
          <Route
            path="projects/:id"
            element={
              <PrivateRoute>
                <ProjectDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="teams"
            element={
              <PrivateRoute>
                <Teams />
              </PrivateRoute>
            }
          />
          <Route
            path="profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<div className="p-4 text-center text-red-600">404 - Page Not Found</div>} />
      </Routes>
    </>
  );
};

export default App;
