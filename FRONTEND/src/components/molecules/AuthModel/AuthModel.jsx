import React, { useState } from 'react';
import { supabase } from '../../../config/SupabaseClient';
import { useNavigate } from 'react-router-dom'; // ✅ Import useNavigate

const AuthModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate(); // ✅ Initialize navigate

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setAuthError('');
  };

  const validateForm = () => {
    if (isResettingPassword) {
      setEmailError('');
      if (!resetEmail) {
        setEmailError('Email is required.');
        return false;
      }
      return true;
    }

    let isValid = true;
    setAuthError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    if (!email) {
      setEmailError('Email is required.');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required.');
      isValid = false;
    } else if (!isLogin && password.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      isValid = false;
    } else if (
      !isLogin &&
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()])/.test(password)
    ) {
      setPasswordError(
        'Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character (!@#$%^&*()).'
      );
      isValid = false;
    }

    if (!isLogin && password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setAuthError(error.message);
    } else {
      onClose(); // Close modal on successful login
      navigate('/create-project'); // ✅ Redirect after login
    }
  };

  const handleSignup = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setAuthError(error.message);
    } else {
      setAuthError('Confirmation email sent. Please check your inbox.');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setIsLogin(true);
    }
  };

  const handlePasswordReset = async () => {
    setLoading(true);
    setResetMessage('');
    setAuthError('');
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    setLoading(false);

    if (error) {
      setAuthError(error.message);
    } else {
      setResetMessage('Password reset email sent. Please check your inbox.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      if (isResettingPassword) {
        handlePasswordReset();
      } else if (isLogin) {
        handleLogin();
      } else {
        handleSignup();
      }
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>
          {isResettingPassword
            ? 'Reset Password'
            : isLogin
            ? 'Sign In'
            : 'Sign Up'}
        </h2>
        <form onSubmit={handleSubmit}>
          {isResettingPassword ? (
            <div className="form-group">
              <label htmlFor="resetEmail">Email Address</label>
              <input
                type="email"
                id="resetEmail"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
              {emailError && <p className="error-message">{emailError}</p>}
            </div>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {emailError && <p className="error-message">{emailError}</p>}
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {passwordError && <p className="error-message">{passwordError}</p>}
              </div>
              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  {confirmPasswordError && (
                    <p className="error-message">{confirmPasswordError}</p>
                  )}
                </div>
              )}
            </>
          )}

          <button type="submit">
            {isResettingPassword
              ? 'Send Reset Email'
              : isLogin
              ? 'Sign In'
              : 'Sign Up'}
          </button>

          {loading && <p>Loading...</p>}
          {authError && <p className="error-message">{authError}</p>}
          {resetMessage && <p className="success-message">{resetMessage}</p>}
        </form>
        <button onClick={() => setIsResettingPassword(!isResettingPassword)}>
          {isResettingPassword ? 'Back to Login' : 'Forgot password?'}
        </button>
        {!isResettingPassword && (
          <button onClick={toggleForm}>
            {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
