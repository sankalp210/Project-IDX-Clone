// src/Router.jsx
import { Routes, Route } from 'react-router-dom';
import { CreateProject } from './pages/createProject';
import { ProjectPlayground } from './pages/ProjectPlayground';
import Home from './pages/Home';
import { ProtectedRoute } from './components/ProtectedRoute';

export const Routers = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/create-project" element={
        <ProtectedRoute>
          <CreateProject />
        </ProtectedRoute>
      } />
      <Route path="/projects/:projectId" element={
        <ProtectedRoute>
          <ProjectPlayground />
        </ProtectedRoute>
      } />
      {/* Removed Dashboard route */}
    </Routes>
  );
};