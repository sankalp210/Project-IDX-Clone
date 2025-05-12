import React, { useState } from 'react';
import { useCreateProject } from "../hooks/apis/mutations/useCreateProject"
import { useNavigate } from "react-router-dom";
import './createProject.css'; // Assuming you'll create a CreateProject.css file for styling
import { FaMicrophone, FaChevronDown, FaPlus, FaGitAlt } from 'react-icons/fa';
// import { SiJavascript, SiTypescript, SiPython, SiJava, SiPhp, SiRuby, SiOauth2 } from 'react-icons/si'; // Placeholder icons

export const CreateProject = () => {

    const navigate = useNavigate();

    const {createProject,isPending} = useCreateProject();
    const [activeTab, setActiveTab] = useState('myWorkspaces');

    async function handleCreateProject(){
        console.log('Creating project...')
        try{
            const response = await createProject();
            console.log('Project created! Now we should redirect to editor');
            navigate(`/projects/${response.data}`);
        } catch(error){
            console.error('Error creating project:', error)
            alert('Error creating project. Please try again later.')  // Replace with your preferred error handling method.
        }
    }

    return (
        <div className="create-project-container">
            <div class="content-wrapper">
            <div className="greeting-section">
                <h1 className="greeting-title">Hello, Sankalp Meshram</h1>
                <p className="greeting-subtitle">Welcome back</p>
            </div>

            <div className="ai-prototype-section">
                <h2 className="section-title">Prototype an app with AI</h2>
                <div className="ai-input-area">
                    <input
                        type="text"
                        placeholder="An app that generates poems from photos"
                        className="ai-input"
                    />
                    <span className="ai-input-tab">Tab</span>
                    <FaMicrophone className="ai-microphone-icon" />
                </div>
                <div className="more-prompts">
                    More sample prompts <FaChevronDown />
                </div>
            </div>

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
                    {/* Placeholder for project cards */}
                </div>
            </div>
            </div>
        </div>
    )
} 
