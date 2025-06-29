import React, { useState } from 'react';
import { useCreateProject } from "../hooks/apis/mutations/useCreateProject";
import { useUserProjects } from "../hooks/apis/queries/useUserProjects";
import { useNavigate } from "react-router-dom";
import './createProject.css';
import { FaMicrophone, FaChevronDown, FaPlus, FaGitAlt, FaTrash } from 'react-icons/fa';
import { deleteProjectApi } from "../apis/projects"; // ✅ Make sure this is correct path

export const CreateProject = () => {
  const navigate = useNavigate();
  const { createProject, isPending } = useCreateProject();
  const { data: projects, isLoading, error, refetch } = useUserProjects(); // ✅ add refetch to update after delete
  const [activeTab, setActiveTab] = useState('myWorkspaces');

  async function handleCreateProject() {
    try {
      const response = await createProject();
      navigate(`/projects/${response.data}`);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Error creating project. Please try again later.');
    }
  }

  async function handleDeleteProject(projectId, e) {
    e.stopPropagation(); // 🚫 prevent card click from firing navigate
    try {
      await deleteProjectApi(projectId);
      await refetch(); // ♻️ refresh project list
    } catch (err) {
      console.error("Error deleting project:", err);
      alert("Failed to delete project.");
    }
  }

  return (
    <div className="create-project-container">
      <div className="content-wrapper">
        {/* Greeting */}
        <div className="greeting-section">
          <h1 className="greeting-title">Hello, Sankalp Meshram</h1>
          <p className="greeting-subtitle">Welcome back</p>
        </div>

        {/* AI Prototype Section */}
        <div className="ai-prototype-section">
          <h2 className="section-title">Prototype an app with AI</h2>
          <div className="ai-input-area">
            <input type="text" placeholder="An app that generates poems from photos" className="ai-input" />
            <span className="ai-input-tab">Tab</span>
            <FaMicrophone className="ai-microphone-icon" />
          </div>
          <div className="more-prompts">
            More sample prompts <FaChevronDown />
          </div>
        </div>

        {/* Start Coding */}
        <div className="start-coding-section">
          <h2 className="section-title">Start coding an app</h2>
          <div className="coding-options">
            <button className="new-workspace-button" onClick={handleCreateProject} disabled={isPending}>
              <FaPlus className="button-icon" /> {isPending ? 'Creating...' : 'New Workspace'}
            </button>
            <button className="import-repo-button">
              <FaGitAlt className="button-icon" /> Import Repo
            </button>
          </div>
        </div>

        {/* Workspaces */}
        <div className="workspaces-section">
          <div className="workspaces-tabs">
            <button
              className={`workspace-tab ${activeTab === 'myWorkspaces' ? 'active' : ''}`}
              onClick={() => setActiveTab('myWorkspaces')}
            >
              My workspaces
            </button>
            <button
              className={`workspace-tab ${activeTab === 'sharedWithMe' ? 'active' : ''}`}
              onClick={() => setActiveTab('sharedWithMe')}
            >
              Shared with me
            </button>
          </div>

          <div className="project-list">
            {isLoading ? (
              <p>Loading your projects...</p>
            ) : error ? (
              <p>Error loading projects. Please try again.</p>
            ) : projects?.length === 0 ? (
              <p>No projects yet. Create one!</p>
            ) : (
              projects.map((proj) => (
                <div key={proj.id} className="project-card" onClick={() => navigate(`/projects/${proj.id}`)}>
                  <div className="project-card-content">
                    <h3>{proj.name || "Untitled Project"}</h3>
                    <p>{new Date(proj.created_at).toLocaleString()}</p>
                  </div>
                  <button
                    className="delete-button"
                    onClick={(e) => handleDeleteProject(proj.id, e)}
                    title="Delete Project"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
