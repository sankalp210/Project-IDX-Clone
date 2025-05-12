import React, { useState } from 'react';
import './Home.css'; // Assuming you'll create a Home.css file for styling
import AuthModal from '../components/molecules/AuthModel/AuthModel.jsx';
import { FaCode, FaRocket, FaUsers } from 'react-icons/fa';

const Home = () => {
    const [showModal, setShowModal] = useState(false);

    const handleGetStartedClick = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    return (
        <div className="home-container">
            <nav className="navbar">
                <div className="navbar-brand">CodeCanvas</div>
                <div className="navbar-links">
                    <button className="nav-button">Sign In</button>
                    <button className="nav-button">Sign Up</button>
                </div>
            </nav>
            <div className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Build, collaborate, code together</h1>
                    <p className="hero-subtitle">
                        A powerful browser-based IDE for seamless development. Create, share, and deploy projects right
                        from your browser.
                    </p>
                    <button className="get-started-button" onClick={handleGetStartedClick}>
                        Get Started
                    </button>
                </div>
                <div className="code-block">
                    <div className="code-header">
                        <div className="dot red"></div>
                        <div className="dot yellow"></div>
                        <div className="dot green"></div>
                    </div>
                    <pre>
                        <code className="language-javascript">
{`const app = createApp({
  name: 'my-project',
  version: '1.0.0',
  features: ['live-preview', 'real-time-collab'],
  onInit() {
    console.log('Project Initialized!');
  }
});`}
                        </code>
                    </pre>
                </div>
            </div>
            <div className="features-section">
                <div className="feature-card">
                    <FaCode className="feature-icon" />
                    <h3>Browser IDE</h3>
                    <p>Code from anywhere with our powerful browser-based development environment</p>
                </div>
                <div className="feature-card">
                    <FaRocket className="feature-icon" />
                    <h3>Instant Deploy</h3>
                    <p>Deploy your projects instantly and share them with anyone around the world</p>
                </div>
                <div className="feature-card">
                    <FaUsers className="feature-icon" />
                    <h3>Real-time Collab</h3>
                    <p>Work together seamlessly with real-time collaboration features</p>
                </div>
            </div>

            {showModal && <AuthModal isOpen={showModal} onClose={handleCloseModal} />}
        </div>
    );
};

export default Home;