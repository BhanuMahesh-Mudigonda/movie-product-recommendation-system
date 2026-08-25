import React, { useState } from 'react';
import PasswordField from './PasswordField';
import { useAuth } from '../../context/AuthContext';

export default function SignupForm({ onAuthSuccess }) {
  const { signup } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Full name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await signup(formData.name, formData.email, formData.password, formData.phone);
      onAuthSuccess?.(); // Proceed to app
    } catch (err) {
      setApiError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    if (apiError) setApiError('');
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {apiError && (
        <div className="error-message" style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          color: '#f87171',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '0.9rem',
          textAlign: 'center',
          marginBottom: '16px'
        }}>
          {apiError}
        </div>
      )}
      
      <div className="form-group">
        <label>Full Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`auth-input ${errors.name ? 'error' : ''}`}
          placeholder="John Doe"
          autoComplete="name"
          disabled={isSubmitting}
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label>Email Address</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`auth-input ${errors.email ? 'error' : ''}`}
          placeholder="name@example.com"
          autoComplete="email"
          disabled={isSubmitting}
        />
        {errors.email && <span className="error-message">{errors.email}</span>}
      </div>

      <div className="form-group">
        <label>Phone Number (Optional)</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="auth-input"
          placeholder="+91 9876543210"
          autoComplete="tel"
          disabled={isSubmitting}
        />
      </div>

      <PasswordField 
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        disabled={isSubmitting}
      />

      <PasswordField 
        value={formData.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
        placeholder="Confirm Password"
        name="confirmPassword"
        disabled={isSubmitting}
      />

      <button type="submit" className="submit-btn" disabled={isSubmitting}>
        {isSubmitting ? 'Creating Account...' : 'CREATE ACCOUNT \u2192'}
      </button>
    </form>
  );
}
