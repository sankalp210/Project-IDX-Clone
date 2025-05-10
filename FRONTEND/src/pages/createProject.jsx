// src/pages/CreateProject.jsx
import { Button, Card, Layout, List, Typography, message } from "antd";
import { useCreateProject } from "../hooks/apis/mutations/useCreateProject";
import { useGetUserProjects } from "../hooks/apis/queries/useGetUserProjects";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

// Destructure Typography components safely
const { Title, Text: AntText } = Typography;
const { Header, Content, Footer } = Layout;

const layoutStyle = {
  borderRadius: 8,
  overflow: 'hidden',
  width: 'calc(100% - 32px)',
  maxWidth: 1200,
  margin: '16px auto',
  border: '2px solid #f0f0f0',
};

const headerStyle = {
  textAlign: 'center',
  color: '#fff',
  height: 120,
  paddingInline: 48,
  lineHeight: '64px',
  backgroundColor: '#1890ff',
};

const contentStyle = {
  minHeight: '60vh',
  padding: '24px',
  color: '#000',
  backgroundColor: 'white',
};

export const CreateProject = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const { createProject, isPending } = useCreateProject();
  const { data: projects = [], isLoading } = useGetUserProjects();

  async function handleCreateProject() {
    try {
      const response = await createProject();
      message.success('Project created successfully!');
      navigate(`/projects/${response.data}`);
    } catch (error) {
      message.error('Error creating project. Please try again later.');
    }
  }

  return (
    <Layout style={layoutStyle}>
      <Header style={headerStyle}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          width: '100%'
        }}>
          <Title level={3} style={{ color: '#fff', margin: 0 }}>
            {user?.email}'s Workspace
          </Title>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button onClick={() => navigate('/')}>Home</Button>
            <Button onClick={() => signOut().then(() => navigate('/'))}>
              Sign Out
            </Button>
          </div>
        </div>
      </Header>

      <Content style={contentStyle}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: 24
        }}>
          <Title level={4}>Your Projects</Title>
          <Button 
            type="primary"
            onClick={handleCreateProject}
            loading={isPending}
          >
            New Project
          </Button>
        </div>

        <List
          grid={{ gutter: 16, column: 4 }}
          dataSource={projects}
          loading={isLoading}
          renderItem={(project) => (
            <List.Item>
              <Card 
                hoverable
                onClick={() => navigate(`/projects/${project.id}`)}
                cover={
                  <div style={{ 
                    height: 120, 
                    background: '#f0f2f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Title level={4} style={{ margin: 0 }}>{project.name}</Title>
                  </div>
                }
              >
                <Card.Meta 
                  description={`Last modified: ${new Date(project.updated_at).toLocaleString()}`}
                />
              </Card>
            </List.Item>
          )}
        />
      </Content>

      <Footer style={{ 
        textAlign: 'center', 
        backgroundColor: '#f0f0f0',
        padding: '16px'
      }}>
        <AntText>CodeSandbox Clone - Created by You</AntText>
      </Footer>
    </Layout>
  );
};