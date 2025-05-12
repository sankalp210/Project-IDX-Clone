import { Routes, Route, Navigate } from 'react-router-dom';
import { CreateProject } from './pages/createProject';
import { ProjectPlayground } from './pages/ProjectPlayground';
import Home from './pages/Home'; // Assuming Home is your landing page
import { supabase } from './config/SupabaseClient'; // Import Supabase client
import { useState, useEffect } from 'react';

const PrivateRoute = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Or a more sophisticated loading indicator
  }

  return session ? children : <Navigate to="/" />;
};

export const Routers = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={<Home />} // Home page will now handle redirection if authenticated
      />
      <Route
        path="/create-project" // New route for creating projects
        element={
          <PrivateRoute>
            <CreateProject />
          </PrivateRoute>
        }
      />
      <Route
        path="/projects/:projectId"
        element={
          <PrivateRoute>
            <ProjectPlayground />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};