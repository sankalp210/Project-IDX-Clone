// src/components/auth/SignupForm.jsx
import { Button, Form, Input, Typography, message } from 'antd';
import { supabase } from '../../config/supabase';
import { useAuthStore } from '../../store/authStore';

const { Link } = Typography;

export const SignupForm = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const { setUser } = useAuthStore();

  const handleSignup = async (values) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.name // Optional: Store additional user data
          }
        }
      });
      
      if (error) throw error;
      setUser(data.user);
      message.success('Account created successfully! Please check your email for verification.');
      onSuccess?.();
    } catch (error) {
      message.error(error.message || 'Signup failed');
    }
  };

  return (
    <Form form={form} onFinish={handleSignup} layout="vertical">
      <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
        <Input placeholder="Your name" />
      </Form.Item>
      <Form.Item 
        name="email" 
        label="Email" 
        rules={[
          { required: true }, 
          { type: 'email', message: 'Invalid email' }
        ]}
      >
        <Input type="email" placeholder="your@email.com" />
      </Form.Item>
      <Form.Item 
        name="password" 
        label="Password" 
        rules={[
          { required: true },
          { min: 6, message: 'Minimum 6 characters' }
        ]}
      >
        <Input.Password placeholder="••••••" />
      </Form.Item>
      <Form.Item 
        name="confirm" 
        label="Confirm Password"
        dependencies={['password']}
        rules={[
          { required: true },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject('Passwords do not match!');
            },
          }),
        ]}
      >
        <Input.Password placeholder="••••••" />
      </Form.Item>
      <Button type="primary" htmlType="submit" block>
        Create Account
      </Button>
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <Link onClick={() => onSuccess?.('login')}>Already have an account? Login</Link>
      </div>
    </Form>
  );
};