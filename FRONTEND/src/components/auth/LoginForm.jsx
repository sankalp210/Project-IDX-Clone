// src/components/auth/LoginForm.jsx
import { Button, Form, Input, Typography } from 'antd';
import { supabase } from '../../config/supabase';
import { useAuthStore } from '../../store/authStore';

const { Link } = Typography;

export const LoginForm = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const { setUser } = useAuthStore();

  const handleLogin = async (values) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (error) throw error;
    setUser(data.user);
    onSuccess?.();
  };

  return (
    <Form form={form} onFinish={handleLogin} layout="vertical">
      <Form.Item name="email" label="Email" rules={[{ required: true }]}>
        <Input type="email" />
      </Form.Item>
      <Form.Item name="password" label="Password" rules={[{ required: true }]}>
        <Input.Password />
      </Form.Item>
      <Button type="primary" htmlType="submit" block>
        Login
      </Button>
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <Link onClick={() => navigate('/signup')}>Create new account</Link>
      </div>
    </Form>
  );
};