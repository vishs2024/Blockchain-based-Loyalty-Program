// src/components/Auth/LoginPage.js
import React, { useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { login, signup } = useContext(AuthContext);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    const { email, password, confirmPassword, firstName, lastName } = formData;
    
    if (!email || !password) {
      setError('Email and password are required');
      return false;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (!isLogin) {
      if (!firstName || !lastName) {
        setError('First name and last name are required');
        return false;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          setSuccess('Login successful! Redirecting...');
        } else {
          setError(result.error || 'Login failed');
        }
      } else {
        const result = await signup({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName
        });
        
        if (result.success) {
          setSuccess('Account created successfully! Please login.');
          setIsLogin(true);
          setFormData({
            email: formData.email,
            password: '',
            confirmPassword: '',
            firstName: '',
            lastName: ''
          });
        } else {
          setError(result.error || 'Signup failed');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError('An unexpected error occurred');
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-card">
          <div className="auth-header">
            <div className="logo">
              <div className="logo-icon">BR</div>
              <h1>BlockRewards</h1>
            </div>
            <p className="auth-subtitle">
              {isLogin ? 'Welcome back to your loyalty program' : 'Join the future of loyalty rewards'}
            </p>
          </div>

          <div className="auth-tabs">
            <button 
              className={`tab-button ${isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button 
              className={`tab-button ${!isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter your first name"
                      required={!isLogin}
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter your last name"
                      required={!isLogin}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  required={!isLogin}
                />
              </div>
            )}

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <button 
              type="submit" 
              className="auth-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  {isLogin ? 'Logging in...' : 'Creating account...'}
                </>
              ) : (
                isLogin ? 'Login' : 'Create Account'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                className="link-button"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? 'Sign up here' : 'Login here'}
              </button>
            </p>
          </div>

          <div className="auth-features">
            <div className="feature">
              <span className="feature-icon">🔐</span>
              <span>Secure IPFS Storage</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🌐</span>
              <span>Decentralized Identity</span>
            </div>
            <div className="feature">
              <span className="feature-icon">💎</span>
              <span>Blockchain Rewards</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
