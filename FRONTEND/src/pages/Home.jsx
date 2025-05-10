// src/pages/Home.jsx
import { useState } from 'react';
import { Button, Modal, Typography, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LoginForm } from '../components/auth/LoginForm';
import { SignupForm } from '../components/auth/SignUpForm';

const { Title, Text } = Typography;

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [authModal, setAuthModal] = useState(null);

  const handleAuthSuccess = () => {
    setAuthModal(null);
    navigate('/create-project'); // Direct to merged workspace
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '0 24px',
      textAlign: 'center'
    }}>
      {/* Hero Section */}
      <Space direction="vertical" size="large">
        <Title level={2} style={{ fontSize: '2.5rem', marginBottom: 0 }}>
          Welcome to CodeSandbox Clone
        </Title>
        
        <Text type="secondary" style={{ fontSize: '1.1rem' }}>
          Build, collaborate, and deploy projects right from your browser
        </Text>

        {/* Auth Buttons */}
        <Space size="middle">
          {user ? (
            <Button 
              type="primary" 
              size="large"
              shape="round"
              onClick={() => navigate('/create-project')}
              style={{ padding: '0 32px', height: 40 }}
            >
              Open Workspace
            </Button>
          ) : (
            <>
              <Button 
                type="primary" 
                size="large"
                shape="round"
                onClick={() => setAuthModal('login')}
                style={{ padding: '0 32px', height: 40 }}
              >
                Sign In
              </Button>
              <Button 
                size="large"
                shape="round"
                onClick={() => setAuthModal('signup')}
                style={{ padding: '0 32px', height: 40 }}
              >
                Sign Up
              </Button>
            </>
          )}
        </Space>
      </Space>

      {/* Features Preview (Optional) */}
      <div style={{ 
        display: 'flex', 
        gap: 24, 
        marginTop: 48,
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {[
          { icon: '💻', title: 'Browser IDE', desc: 'Code from anywhere' },
          { icon: '🚀', title: 'Instant Deploy', desc: 'Share your projects' },
          { icon: '🤝', title: 'Real-time Collab', desc: 'Code together' }
        ].map((item, i) => (
          <div key={i} style={{ 
            background: 'rgba(255,255,255,0.8)', 
            padding: '16px 24px', 
            borderRadius: 12,
            width: 180,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <Text style={{ fontSize: 24 }}>{item.icon}</Text>
            <div>
              <Text strong>{item.title}</Text>
              <br />
              <Text type="secondary">{item.desc}</Text>
            </div>
          </div>
        ))}
      </div>

      {/* Auth Modals */}
      <Modal
        title={authModal === 'login' ? 'Sign In to Your Account' : 'Create New Account'}
        open={!!authModal}
        onCancel={() => setAuthModal(null)}
        footer={null}
        centered
        destroyOnClose
        styles={{
          header: { borderBottom: '1px solid #f0f0f0', marginBottom: 24 },
          body: { paddingBottom: 0 }
        }}
      >
        {authModal === 'login' ? (
          <LoginForm 
            onSuccess={handleAuthSuccess}
            switchToSignup={() => setAuthModal('signup')} 
          />
        ) : (
          <SignupForm 
            onSuccess={handleAuthSuccess}
            switchToLogin={() => setAuthModal('login')}
          />
        )}
      </Modal>
    </div>
  );
};

export default Home;