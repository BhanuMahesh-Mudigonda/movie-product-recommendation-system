import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function EmailLoginForm({ onAuthSuccess }) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fillDemoAccount = () => {
    setFormData({
      email: 'demo@moviemind.ai',
      password: 'MovieMind@123',
      rememberMe: true
    });
    setErrors({});
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await login(formData.email, formData.password);
      // Slight 200ms delay to allow button feedback animation
      setTimeout(() => {
        onAuthSuccess?.();
      }, 200);
    } catch (err) {
      setApiError('Incorrect email or password.');
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    if (apiError) setApiError('');
  };

  return (
    <form className="hud-form" onSubmit={handleSubmit}>
      {apiError && (
        <div className="error-message-box">
          {apiError}
        </div>
      )}

      {/* TERMINAL DEMO CHIP */}
      <div className="hud-demo-chip">
        <div className="chip-meta">
          <span className="chip-dot"></span>
          <span className="chip-title">DEMO ACCESS</span>
          <span className="chip-email">demo@moviemind.ai</span>
        </div>
        <button
          type="button"
          onClick={fillDemoAccount}
          className="chip-action-btn"
          disabled={isSubmitting}
        >
          ENTER DEMO &rarr;
        </button>
      </div>

      {/* EMAIL UNDERLINED FIELD */}
      <div className="hud-input-group email-group">
        <label className="hud-label">Email Address</label>
        <div className="hud-input-line-wrapper">
          <User size={18} className="hud-input-icon" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`hud-underlined-input ${errors.email ? 'error' : ''}`}
            placeholder="name@example.com"
            autoComplete="email"
            disabled={isSubmitting}
          />
        </div>
        {errors.email && <span className="error-text">{errors.email}</span>}
      </div>

      {/* PASSWORD UNDERLINED FIELD */}
      <div className="hud-input-group password-group">
        <label className="hud-label">Password</label>
        <div className="hud-input-line-wrapper">
          <Lock size={18} className="hud-input-icon" />
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`hud-underlined-input ${errors.password ? 'error' : ''}`}
            placeholder="Enter your password"
            autoComplete="current-password"
            disabled={isSubmitting}
          />
          <button
            type="button"
            className="hud-eye-toggle"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isSubmitting}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && <span className="error-text">{errors.password}</span>}
      </div>

      {/* REMEMBER ME & FORGOT PASSWORD */}
      <div className="hud-form-options">
        <label className="hud-checkbox-label">
          <input 
            type="checkbox" 
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          <span>Remember me</span>
        </label>

        <button type="button" className="hud-forgot-btn" disabled={isSubmitting}>
          Forgot Password?
        </button>
      </div>

      {/* METALLIC MOVIEMIND PORTAL BUTTON WITH ACTIVATION ANIMATION */}
      <button 
        type="submit" 
        className={`moviemind-portal-btn ${isSubmitting ? 'submitting' : ''}`} 
        disabled={isSubmitting}
      >
        <span className="btn-energy-water"></span>
        <span className="btn-energy-fire"></span>
        <span className="btn-light-sweep"></span>
        <span className="btn-text">
          {isSubmitting ? 'ENTERING MOVIEMIND...' : 'ENTER MOVIEMIND \u2192'}
        </span>
      </button>
    </form>
  );
}
